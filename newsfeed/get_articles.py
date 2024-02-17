import requests

url = "https://apidojo-yahoo-finance-v1.p.rapidapi.com/news/v2/list"

querystring = {"region":"US","snippetCount":"28","s":"AAPL"}

payload = " "
headers = {
	"content-type": "text/plain",
	"X-RapidAPI-Key": "3b5b13d5f3msh7d170972d3d1771p1459d9jsn5420a861497d",
	"X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com"
}

response = requests.post(url, data=payload, headers=headers, params=querystring)

text = response.json()


def get_art(text):
    output = []
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

print(get_art(text))