import os
import asyncio
from google.cloud import bigquery
from google.oauth2 import service_account

SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]


def get_bigquery_client():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    creds_path = os.path.join(
        current_dir, "credentials", "loan-dashboard-491908-95e07f0be151.json"
    )

    credentials = service_account.Credentials.from_service_account_file(
        creds_path,
        scopes=SCOPES
    )

    return bigquery.Client(
        credentials=credentials,
        project=credentials.project_id
    )


def _fetch_all_loan_data_sync():
    """
    Sync function (actual BigQuery call)
    """
    client = get_bigquery_client()

    query = """
    SELECT *
    FROM `loan-dashboard-491908.loan_data.loans_table`
    """

    query_job = client.query(query)
    results = query_job.result()

    return [dict(row) for row in results]


async def fetch_all_loan_data():
    """
    Async wrapper (non-blocking)
    """
    return await asyncio.to_thread(_fetch_all_loan_data_sync)


