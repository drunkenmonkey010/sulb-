from pydantic import BaseModel
from typing import List, Optional, Any

class ExecutionResult(BaseModel):
    """Represents the structured result of a single code block execution."""
    code: str
    final_df: Optional[Any] = None
    plotly_json: Optional[str] = None
    data_story: Optional[str] = None
    logs: Optional[str] = None
    error: Optional[str] = None

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    text_answer: str
    execution_results: dict
    input_tokens: int
    output_tokens: int
    cost_estimate_usd: float


class QueryRequest(BaseModel):
    query:str
    session_id:str
