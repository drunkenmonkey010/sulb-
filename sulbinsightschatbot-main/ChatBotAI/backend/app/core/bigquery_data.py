from fastapi import Depends, Request

def get_bigquery_data(request: Request):
    return request.app.state.bigquery_data