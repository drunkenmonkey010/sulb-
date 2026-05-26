import logging
import re
from typing import Optional
import tiktoken
from core.hybrid_llm_chain import get_hybrid_llm_chain
# from services.data_service import data_service
from schemas.chat_schemas import ChatResponse
from executor.new_executor import run_code
import logging
import json
import pickle
import pandas as pd

class HybridLLMService:
    def __init__(
        self,
        llm_chain,
        
    ):
        self.llm_chain = llm_chain
    def structured_to_list(self,final_df):
        if not final_df or "columns" not in final_df:
            return final_df  # already correct format

        columns = final_df["columns"]
        data = final_df["data"]

        result = []
        for row in data:
            row_dict = dict(zip(columns, row))
            result.append(row_dict)

        return result  

    def normalize_plotly_json(self,plotly_json):
        if isinstance(plotly_json, str):
            try:
                return json.loads(plotly_json)
            except json.JSONDecodeError:
                return None
        return plotly_json
    def extract_result_json(self,stdout: str):
        """Extract JSON between __RESULT_START__ and __RESULT_END__"""
        match = re.search(r"__RESULT_START__(.*)__RESULT_END__", stdout, re.DOTALL)
        if not match:
            logging.warning("No JSON result found in stdout")
            return {}
        try:
            result_json = json.loads(match.group(1).strip())
            return result_json
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse JSON from stdout: {e}")
            return {}

    async def hybrid_generate_response(self, query: str) :
        logging.info(f"Getting DataFrames from the bigquery.")
        # with open("documents.pkl", "rb") as f:
        #         execution_context = pickle.load(f)
        df = pd.read_excel(r"D:\ChatBotAI\backend\app\core\GNX_Data_070426.xlsx")

        # print("execution_context",len(execution_context))
        df = pd.DataFrame(df)
        print("df",df[0:5])
        
        # if not execution_context:
        #     return ChatResponse(
        #         text_answer="I'm sorry, but I was unable to load the necessary data. Please check the server logs.",
        #         execution_results=[],
        #         input_tokens=0,
        #         output_tokens=0,
        #         cost_estimate_usd=0.0,
        #     )

        logging.info(f"Invoking LLM with query: {query}")
        response = self.llm_chain.invoke({"question": query})
        llm_response_content = response.content
        print("llm",llm_response_content)
        logging.info("LLM invocation complete.")

        # Calculate token usage and cost first
        encoding = tiktoken.get_encoding("cl100k_base")
        input_tokens = len(encoding.encode(query))
        output_tokens = len(encoding.encode(llm_response_content))
        cost_estimate_usd = (
            (input_tokens / 1_000_000) * 0.15
            + (output_tokens / 1_000_000) * 0.60
        )

        # Check for code blocks to decide the response strategy
        code_blocks = re.findall(r"```(?:python\n)?(.*?)```", llm_response_content, re.DOTALL)

        if not code_blocks:
            # No code found, return the conversational response directly
            logging.info("No code blocks found. Returning conversational response.")
            return ChatResponse(
                text_answer=llm_response_content,
                execution_results=[],
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_estimate_usd=round(cost_estimate_usd, 6),
            )

        # # Code found, proceed with execution
        logging.info(f"Found {len(code_blocks)} code blocks. Executing...")
        dataframes = {
            "LOAN_DATA": df,
            # "PHYSICIAN_UNIVERSE": physician_df  # add if available
        }
        execution_results = run_code(
            llm_response_content, dataframes
        )
        print("execution",execution_results)
        # # The data_story is now expected to be in the execution results
        # Extract structured JSON from stdout
        stdout = execution_results.get("stdout", "")
        result_json = self.extract_result_json(stdout)
        result_json["final_df"] = self.structured_to_list(result_json["final_df"])
        result_json["plotly_json"] = self.normalize_plotly_json(result_json["plotly_json"])        
        print("result_json",result_json)

        # Pull the data story
        data_story = result_json.get("data_story", "")


        return ChatResponse(
            text_answer="data_story",
            execution_results=result_json,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_estimate_usd=round(cost_estimate_usd, 6),
        )

       


def get_hybrid_service(_type: Optional[str] = None) -> HybridLLMService:
    """Factory function to get LLM service instance"""
    # The LLM chain will now use our specific system prompt
    llm_chain = get_hybrid_llm_chain()
    
    return HybridLLMService(
        llm_chain=llm_chain,
        
    )
    
    
    
    
    
