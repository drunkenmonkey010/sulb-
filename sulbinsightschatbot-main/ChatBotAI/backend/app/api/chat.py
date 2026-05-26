from fastapi import APIRouter, HTTPException, status, Depends,Request
from schemas.chat_schemas import ChatResponse, ChatRequest
from services.llm_service import get_llm_service
from services.hybrid_aggregate import get_hybrid_service
from core.config import settings
import logging
from langchain_google_genai import ChatGoogleGenerativeAI


logger = logging.getLogger(__name__)


router = APIRouter(
    prefix="/api/v1/chat",
    tags=["chat"],
    responses={404: {"description": "Not found"}},
)

llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        # max_tokens=None,
        # max_retries=6,
        # stop=None,
        google_api_key=settings.GEMINI_API_KEY
    )

def classify_query_llm( query: str):
    prompt = f"""
    Classify the query into one of these:
    - AGGREGATION (sum, total, count, avg)
    - LOOKUP (retrieve specific rows)
    - ANALYSIS (explain, trends)

    Query: {query}

    Answer ONLY one word.
    """

    result = llm.invoke( prompt)
    return result.content.strip()

@router.post("/generate_response")
async def generate_response(body: ChatRequest, request: Request):
    logging.info(f"Received chat request: {body.query}")
    classifier = classify_query_llm(body.query)
    print (classifier)
    if classifier == "AGGREGATION":
        llm_service = get_hybrid_service()
        response = await llm_service.hybrid_generate_response(body.query)

    else:
        llm_service = get_llm_service()
        response = await llm_service.generate_response(body.query,request)
    # logging.info(f"Generated response: {response.text_answer}")
    return response