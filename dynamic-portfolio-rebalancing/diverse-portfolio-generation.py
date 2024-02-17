import os
import numpy as np
import pandas as pd
from datetime import datetime
import pytz
import warnings
from numba import njit
from collections import defaultdict


from pypfopt.efficient_frontier import EfficientFrontier
from pypfopt import risk_models
from pypfopt import expected_returns, objective_functions
from pypfopt import base_optimizer

from pypfopt.discrete_allocation import DiscreteAllocation, get_latest_prices

import vectorbt as vbt
from vectorbt.generic.nb import nanmean_nb
from vectorbt.portfolio.nb import order_nb, sort_call_seq_nb
from vectorbt.portfolio.enums import SizeType, Direction

warnings.filterwarnings("ignore")
pd.options.display.float_format = '{:.4f}'.format

symbols = [ 'JCI', 'TGT', 'CMCSA', 'CPB', 'MO', 'APA', 'MMC', 'JPM', # test data
          'ZION', 'PSA', 'BAX', 'BMY', 'LUV', 'PCAR', 'TXT', 'TMO',
          'DE', 'MSFT', 'HPQ', 'SEE', 'VZ', 'CNP', 'NI', 'T', 'BA','AAPL'] 

sector_mapper = {
    'JCI': 'Automotive',
    'TGT': 'Retail',
    'CMCSA': 'Media',
    'CPB': 'Food and Beverage',
    'MO': 'Tobacco',
    'APA': 'Energy',
    'MMC': 'Insurance',
    'JPM': 'Finance',
    'ZION': 'Finance',
    'PSA': 'Real Estate',
    'BAX': 'Healthcare',
    'BMY': 'Healthcare',
    'LUV': 'Aviation',
    'PCAR': 'Automotive',
    'TXT': 'Aerospace',
    'TMO': 'Healthcare',
    'DE': 'Machinery',
    'MSFT': 'Technology',
    'HPQ': 'Technology',
    'SEE': 'Chemicals',
    'VZ': 'Telecommunications',
    'CNP': 'Utilities',
    'NI': 'Utilities',
    'T': 'Telecommunications',
    'BA': 'Aerospace',
    'AAPL': 'Technology'
}

sector_lower = {"Technology": 0.4,
                "Telecommunications" : 0.2
                }  # at least 

sector_upper = {
    "Technology": 0.6,  
    "Aerospace": 0.1  # less than 10% oil and gas
}

def get_diverse_portfolio(symbols, investment_amount, max_risk_threshold = 1.0, max_return_threshold = 0.2, diversity_order = 1, sector_mapper = sector_mapper, sector_upper = {}, sector_lower = {}):
    symbols.sort()
    start_date = '2010-01-01'
    end_date = '2023-01-01'

    vbt.settings.array_wrapper['freq'] = 'days'
    vbt.settings.returns['year_freq'] = '252 days'
    vbt.settings.portfolio['seed'] = 42
    vbt.settings.portfolio.stats['incl_unrealized'] = True

    yfdata = vbt.YFData.download(symbols, start=start_date, end=end_date)

    ohlcv = yfdata.concat()

    close_price = ohlcv['Close']
    open_price = ohlcv['Open']

    features = [close_price, open_price]
    feature_list = ["close_price", "open_price"]

    output_dict = {
        "close_price" : {1: [], 2: [], 3: []},
        "open_price" : {1: [], 2: [], 3: []},
    }

    for index,feature in enumerate(features):
        avg_returns = expected_returns.mean_historical_return(feature)
        cov_mat = risk_models.sample_cov(feature)

        allocation_sh, sector_counts_sh, return_stats_sh, port_performance_sh = max_sharpe_score(avg_returns, cov_mat, feature, investment_amount, diversity_order)
        allocation_ret, sector_counts_ret, return_stats_ret, port_performance_ret = max_efficient_return(avg_returns, cov_mat, feature, investment_amount, diversity_order, max_return_threshold)
        allocation_risk, sector_counts_risk, return_stats_risk, port_performance_risk = max_efficient_risk(avg_returns, cov_mat, feature, investment_amount, diversity_order, max_risk_threshold)

        output_dict[feature_list[index]][1].append([allocation_sh, sector_counts_sh, return_stats_sh, port_performance_sh])
        output_dict[feature_list[index]][2].append([allocation_ret, sector_counts_ret, return_stats_ret, port_performance_ret])
        output_dict[feature_list[index]][3].append([allocation_risk, sector_counts_risk, return_stats_risk, port_performance_risk])

    print(output_dict)

def max_sharpe_score(avg_returns, cov_mat, feature, investment_amount, diversity_order):

    gamma = 0.01
    curr_div_order = 0 

    while curr_div_order < diversity_order:

        ef = EfficientFrontier(avg_returns, cov_mat)
        ef.add_objective(objective_functions.L2_reg, gamma = gamma)

        weights = ef.max_sharpe()

        portfolio_performance = ef.portfolio_performance()

        clean_weights = ef.clean_weights()

        pyopt_weights = np.array([clean_weights[symbol] for symbol in symbols])

        latest_prices = get_latest_prices(feature)

        da = DiscreteAllocation(weights, latest_prices, total_portfolio_value=investment_amount)

        allocation, leftover = da.lp_portfolio()

        pyopt_size = np.full_like(feature, np.nan)
        pyopt_size[0, :] = pyopt_weights  # allocate at first timestamp, do nothing afterwards

        # Run simulation with weights from PyPortfolioOpt
        pyopt_pf = vbt.Portfolio.from_orders(
            close=feature,
            size=pyopt_size,
            size_type='targetpercent',
            group_by=True,
            cash_sharing=True
        )

        curr_div_order = len(pyopt_pf.orders)

        if curr_div_order < diversity_order:
            gamma = gamma + 0.5
            del ef

    sector_counts = defaultdict(int)
    for asset, count in allocation.items():
        sector = sector_mapper.get(asset)
        if sector:
            sector_counts[sector] += count

    sector_counts = dict(sector_counts)

    portfolio_performance_dict = {
        "Expected annual return [%]" : portfolio_performance[0],
        "Annual volatility [%]" : portfolio_performance[1]
    }

    stats_dict = {
    'Start': pyopt_pf.stats().loc['Start'],
    'End': pyopt_pf.stats().loc['End'],
    'Period': pyopt_pf.stats().loc['Period'],
    'Start Value': pyopt_pf.stats().loc['Start Value'],
    'End Value': pyopt_pf.stats().loc['End Value'],
    'Total Return [%]': pyopt_pf.stats().loc['Total Return [%]'],
    'Benchmark Return [%]': pyopt_pf.stats().loc['Benchmark Return [%]'],
    'Sharpe Ratio': pyopt_pf.stats().loc['Sharpe Ratio'],
    }
        
    return allocation, sector_counts, stats_dict, portfolio_performance_dict

def max_efficient_return(avg_returns, cov_mat, feature, investment_amount, diversity_order, max_return_threshold):
    gamma = 0.01
    curr_div_order = 0 

    while curr_div_order < diversity_order:

        ef = EfficientFrontier(avg_returns, cov_mat)
        ef.add_objective(objective_functions.L2_reg, gamma = gamma)

        weights = ef.efficient_return(target_return=max_return_threshold)

        portfolio_performance = ef.portfolio_performance()

        clean_weights = ef.clean_weights()

        pyopt_weights = np.array([clean_weights[symbol] for symbol in symbols])

        latest_prices = get_latest_prices(feature)

        da = DiscreteAllocation(weights, latest_prices, total_portfolio_value=investment_amount)

        allocation, leftover = da.lp_portfolio()

        pyopt_size = np.full_like(feature, np.nan)
        pyopt_size[0, :] = pyopt_weights  # allocate at first timestamp, do nothing afterwards

        # Run simulation with weights from PyPortfolioOpt
        pyopt_pf = vbt.Portfolio.from_orders(
            close=feature,
            size=pyopt_size,
            size_type='targetpercent',
            group_by=True,
            cash_sharing=True
        )

        curr_div_order = len(pyopt_pf.orders)

        if curr_div_order < diversity_order:
            gamma = gamma + 0.5
            del ef

    sector_counts = defaultdict(int)
    for asset, count in allocation.items():
        sector = sector_mapper.get(asset)
        if sector:
            sector_counts[sector] += count

    sector_counts = dict(sector_counts)

    portfolio_performance_dict = {
        "Expected annual return [%]" : portfolio_performance[0],
        "Annual volatility [%]" : portfolio_performance[1]
    }

    stats_dict = {
    'Start': pyopt_pf.stats().loc['Start'],
    'End': pyopt_pf.stats().loc['End'],
    'Period': pyopt_pf.stats().loc['Period'],
    'Start Value': pyopt_pf.stats().loc['Start Value'],
    'End Value': pyopt_pf.stats().loc['End Value'],
    'Total Return [%]': pyopt_pf.stats().loc['Total Return [%]'],
    'Benchmark Return [%]': pyopt_pf.stats().loc['Benchmark Return [%]'],
    'Sharpe Ratio': pyopt_pf.stats().loc['Sharpe Ratio'],
    }
        
    return allocation, sector_counts, stats_dict, portfolio_performance_dict

def max_efficient_risk(avg_returns, cov_mat, feature, investment_amount, diversity_order, max_risk_threshold):
    gamma = 0.01
    curr_div_order = 0 

    while curr_div_order < diversity_order:

        ef = EfficientFrontier(avg_returns, cov_mat)
        ef.add_objective(objective_functions.L2_reg, gamma = gamma)

        weights = ef.efficient_risk(target_volatility=max_risk_threshold)

        portfolio_performance = ef.portfolio_performance()

        clean_weights = ef.clean_weights()

        pyopt_weights = np.array([clean_weights[symbol] for symbol in symbols])

        latest_prices = get_latest_prices(feature)

        da = DiscreteAllocation(weights, latest_prices, total_portfolio_value=investment_amount)

        allocation, leftover = da.lp_portfolio()

        pyopt_size = np.full_like(feature, np.nan)
        pyopt_size[0, :] = pyopt_weights  # allocate at first timestamp, do nothing afterwards

        # Run simulation with weights from PyPortfolioOpt
        pyopt_pf = vbt.Portfolio.from_orders(
            close=feature,
            size=pyopt_size,
            size_type='targetpercent',
            group_by=True,
            cash_sharing=True
        )

        curr_div_order = len(pyopt_pf.orders)

        if curr_div_order < diversity_order:
            gamma = gamma + 0.5
            del ef

    sector_counts = defaultdict(int)
    for asset, count in allocation.items():
        sector = sector_mapper.get(asset)
        if sector:
            sector_counts[sector] += count

    sector_counts = dict(sector_counts)

    portfolio_performance_dict = {
        "Expected annual return [%]" : portfolio_performance[0],
        "Annual volatility [%]" : portfolio_performance[1]
    }

    stats_dict = {
    'Start': pyopt_pf.stats().loc['Start'],
    'End': pyopt_pf.stats().loc['End'],
    'Period': pyopt_pf.stats().loc['Period'],
    'Start Value': pyopt_pf.stats().loc['Start Value'],
    'End Value': pyopt_pf.stats().loc['End Value'],
    'Total Return [%]': pyopt_pf.stats().loc['Total Return [%]'],
    'Benchmark Return [%]': pyopt_pf.stats().loc['Benchmark Return [%]'],
    'Sharpe Ratio': pyopt_pf.stats().loc['Sharpe Ratio'],
    }
        
    return allocation, sector_counts, stats_dict, portfolio_performance_dict

# get_diverse_portfolio(symbols, investment_amount = 20000, max_risk_threshold = 1, max_return_threshold = 1, diversity_order = 8, sector_mapper = sector_mapper, sector_upper = sector_upper, sector_lower = sector_lower)
get_diverse_portfolio(symbols, investment_amount = 20000)
