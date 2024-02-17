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

async def api_call(total_investment_amount, asset_allocation = {"stock":0.6,"crypto":0.1,"mf":0.3}, diversity_order = {"stock":10,"crypto":2,"mf":3}):
    crypto_symbols = ['BTC-USD', 'ETH-USD', 'USDT-USD', 'BNB-USD', 'SOL-USD', 'DOGE-USD', 'STETH-USD', 'XRP-USD']

    stock_symbols = [ 'JCI', 'TGT', 'CMCSA', 'CPB', 'MO', 'APA', 'MMC', 'JPM', # test data
            'ZION', 'PSA', 'BAX', 'BMY', 'LUV', 'PCAR', 'TXT', 'TMO',
            'DE', 'MSFT', 'HPQ', 'SEE', 'VZ', 'CNP', 'NI', 'T', 'BA','AAPL'] 

    mutual_funds_symbols = ['ENPIX', 'ENPSX', 'BIPSX', 'WWNPX', 'KNPCX', 'CSVIX', 'CYPSX', 'ACWIX', 'TIQIX', 'TROCX']
    
    investment_stocks = total_investment_amount * asset_allocation["stock"]
    investment_crypto = total_investment_amount * asset_allocation["crpyto"]
    investment_mf = total_investment_amount * asset_allocation["mf"]

    stock_dict = get_diverse_portfolio(symbols=stock_symbols, investment_amount=investment_stocks, diversity_order=diversity_order["stock"])
    crypto_dict = get_diverse_portfolio(symbols=crypto_symbols, investment_amount=investment_crypto, diversity_order=diversity_order["crypto"], year_freq='365')
    mutual_funds_dict = get_diverse_portfolio(symbols=mutual_funds_symbols, investment_amount=investment_mf, diversity_order=diversity_order["mf"])

    return stock_dict, crypto_dict, mutual_funds_dict


def get_diverse_portfolio(symbols, investment_amount, max_risk_threshold = 1.0, max_return_threshold = 0.1, diversity_order = 1, year_freq = '252'):
    symbols.sort()
    start_date = '2010-01-01'
    end_date = '2023-01-01'

    vbt.settings.array_wrapper['freq'] = 'days'
    vbt.settings.returns['year_freq'] = year_freq
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
        avg_returns = expected_returns.mean_historical_return(feature, frequency=int(year_freq))
        cov_mat = risk_models.sample_cov(feature, frequency=int(year_freq))

        allocation_sh, value_counts_sh, return_stats_sh, port_performance_sh = max_sharpe_score(symbols, avg_returns, cov_mat, feature, investment_amount, diversity_order)
        allocation_ret, value_counts_ret, return_stats_ret, port_performance_ret = max_efficient_return(symbols, avg_returns, cov_mat, feature, investment_amount, diversity_order, max_return_threshold)
        allocation_risk, value_counts_risk, return_stats_risk, port_performance_risk = max_efficient_risk(symbols, avg_returns, cov_mat, feature, investment_amount, diversity_order, max_risk_threshold)

        output_dict[feature_list[index]][1].extend([allocation_sh, value_counts_sh, return_stats_sh, port_performance_sh])
        output_dict[feature_list[index]][2].extend([allocation_ret, value_counts_ret, return_stats_ret, port_performance_ret])
        output_dict[feature_list[index]][3].extend([allocation_risk, value_counts_risk, return_stats_risk, port_performance_risk])

    return output_dict

def max_sharpe_score(symbols, avg_returns, cov_mat, feature, investment_amount, diversity_order):

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

    value_counts = {"Count" : sum(allocation.values())}

    portfolio_performance_dict = {
        "Expected annual return [%]" : portfolio_performance[0],
        "Annual volatility [%]" : portfolio_performance[1]
    }

    stats_dict = {
    'Start': '2014-09-17 00:00:00',
    'End': '2022-12-31 00:00:00',
    'Period': str(pyopt_pf.stats().loc['Period']),
    'Start Value': pyopt_pf.stats().loc['Start Value'],
    'End Value': pyopt_pf.stats().loc['End Value'],
    'Total Return [%]': pyopt_pf.stats().loc['Total Return [%]'],
    'Benchmark Return [%]': pyopt_pf.stats().loc['Benchmark Return [%]'],
    'Sharpe Ratio': pyopt_pf.stats().loc['Sharpe Ratio'],
    }
        
    return allocation, value_counts, stats_dict, portfolio_performance_dict

def max_efficient_return(symbols, avg_returns, cov_mat, feature, investment_amount, diversity_order, max_return_threshold):
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

    value_counts = {"Count" : sum(allocation.values())}

    portfolio_performance_dict = {
        "Expected annual return [%]" : portfolio_performance[0],
        "Annual volatility [%]" : portfolio_performance[1]
    }

    stats_dict = {
    'Start': '2014-09-17 00:00:00',
    'End': '2022-12-31 00:00:00',
    'Period': str(pyopt_pf.stats().loc['Period']),
    'Start Value': pyopt_pf.stats().loc['Start Value'],
    'End Value': pyopt_pf.stats().loc['End Value'],
    'Total Return [%]': pyopt_pf.stats().loc['Total Return [%]'],
    'Benchmark Return [%]': pyopt_pf.stats().loc['Benchmark Return [%]'],
    'Sharpe Ratio': pyopt_pf.stats().loc['Sharpe Ratio'],
    }
        
    return allocation, value_counts, stats_dict, portfolio_performance_dict

def max_efficient_risk(symbols, avg_returns, cov_mat, feature, investment_amount, diversity_order, max_risk_threshold):
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

    value_counts = {"Count" : sum(allocation.values())}

    portfolio_performance_dict = {
        "Expected annual return [%]" : portfolio_performance[0],
        "Annual volatility [%]" : portfolio_performance[1]
    }

    stats_dict = {
    'Start': '2014-09-17 00:00:00',
    'End': '2022-12-31 00:00:00',
    'Period': str(pyopt_pf.stats().loc['Period']),
    'Start Value': pyopt_pf.stats().loc['Start Value'],
    'End Value': pyopt_pf.stats().loc['End Value'],
    'Total Return [%]': pyopt_pf.stats().loc['Total Return [%]'],
    'Benchmark Return [%]': pyopt_pf.stats().loc['Benchmark Return [%]'],
    'Sharpe Ratio': pyopt_pf.stats().loc['Sharpe Ratio'],
    }
        
    return allocation, value_counts, stats_dict, portfolio_performance_dict

api_call(total_investment_amount=20000)