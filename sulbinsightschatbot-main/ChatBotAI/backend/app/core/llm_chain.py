from langchain_core.runnables import Runnable
from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import settings
# from core.credentials import credential
from core.prompt_template import chat_prompt

def get_llm_chain() -> Runnable:
    """
    Initializes and returns the LLMChain.
    """

    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        # max_tokens=None,
        # max_retries=6,
        # stop=None,
        google_api_key=settings.GEMINI_RAG_KEY
    )
    
    prompt = chat_prompt
    
    return prompt | llm
