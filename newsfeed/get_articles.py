import requests

import asyncio



async def get_art(symbol):
    output = []
    url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/v2/list"

    querystring = {"region":"US","snippetCount":"28","s":symbol}

    payload = " "
    headers = {
        "content-type": "text/plain",
        "X-RapidAPI-Key": "3b5b13d5f3msh7d170972d3d1771p1459d9jsn5420a861497d",
        "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
    }

    response = requests.post(url, data=payload, headers=headers, params=querystring)

    text = response.json()
    for i in range(10):
        #title
        title = text['data']['main']['stream'][i]['content']['title']
        # article
        # print(text['data']['main']['stream'][i]['content']['clickThroughUrl']['url'])
        if text['data']['main']['stream'][i]['content']['clickThroughUrl'] is None:
            link = text['data']['main']['stream'][i]['content']['previewUrl']
        else:
            link = text['data']['main']['stream'][i]['content']['clickThroughUrl']['url']
        output.append({"Title": title, "Url": link})
    return output

# print(get_art(text))

async def get_stock(symbol, interval, range):
    url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart"
    
    querystring = {"interval":interval,"symbol":symbol,"range":range,"region":"US","includePrePost":"false","useYfid":"true","includeAdjustedClose":"true","events":"capitalGain,div,split"}

    headers = {
        "X-RapidAPI-Key": "3b5b13d5f3msh7d170972d3d1771p1459d9jsn5420a861497d",
        "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)
    text = response.json()
    close = text['chart']['result'][0]['indicators']['quote'][0]['close']
    high = text['chart']['result'][0]['indicators']['quote'][0]['high']
    volume = text['chart']['result'][0]['indicators']['quote'][0]['volume']
    low = text['chart']['result'][0]['indicators']['quote'][0]['low']
    timestamp = text['chart']['result'][0]['timestamp']

    return {"symbol": symbol, "close": close, "high": high, "volume": volume, "low": low, "timestamp": timestamp}


# print(get_stock('AAPL', '1d', '1mo'))