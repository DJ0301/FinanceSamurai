from fastapi import FastAPI, Body
from pydantic import BaseModel
from schemas.api_class import (stock,article)
from fastapi import FastAPI, Request, Form, status, Body, Response, BackgroundTasks
from fastapi.responses import JSONResponse
from newsfeed.get_articles import (get_art, get_stock)

app = FastAPI()


@app.post("/get_stock")
async def stock_details(body: stock):
    output = await get_stock(body.symbol, body.interval, body.range)
    return output


@app.post("/get_article")
async def articles(body: article):
    output = await get_art(body.symbol)
    return output

