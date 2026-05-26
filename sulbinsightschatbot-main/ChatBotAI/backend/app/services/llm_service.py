import logging
import re
from typing import Optional
from fastapi import Request
import tiktoken
from core.llm_chain import get_llm_chain
from schemas.chat_schemas import ChatResponse
from core.bigquery_data import get_bigquery_data
from executor.executor import run_code
import logging
import json
import pandas as pd
import numpy as np
import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer


def build_faiss_index(documents: list, model_name: str = "all-MiniLM-L6-v2"):
        """
        Create embeddings and build a FAISS index.

        Args:
            documents (list): List of text documents
            model_name (str): SentenceTransformer model name

        Returns:
            index (faiss.Index): FAISS index
            embeddings (np.ndarray): Generated embeddings
            embed_model (SentenceTransformer): Loaded embedding model
        """

        # Load embedding model
        embed_model = SentenceTransformer(model_name)

        # Generate embeddings
        embeddings = embed_model.encode(documents, show_progress_bar=True)

        # Convert to numpy array (important for FAISS)
        embeddings = np.array(embeddings).astype("float32")

        # Create FAISS index
        dimension = embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(embeddings)

        print(f"FAISS index created with {len(documents)} documents")

        return index, embeddings, embed_model

def dataframe_to_documents(df: pd.DataFrame, columns: list = None) -> list:
            """
            Convert a pandas DataFrame into a list of text documents (one per row).

            Args:
                df (pd.DataFrame): Input dataframe
                columns (list, optional): Specific columns to include (default = all)

            Returns:
                list: List of row-wise text documents
            """

            # Use selected columns or all
            if columns is None:
                columns = df.columns

            # Fill NaN to avoid issues
            df = df.fillna("")

            def row_to_text(row):
                return ", ".join([f"{col}: {row[col]}" for col in columns])

            documents = df.apply(row_to_text, axis=1).tolist()

            print(f"Loaded {len(documents)} rows")

            return documents


class LLMService:
    def __init__(
        self,
        llm_chain,
        
    ):
        self.llm_chain = llm_chain
                
        if os.path.exists("faiss_index.bin") and os.path.exists("documents.pkl")and os.path.exists("embeddings.npy"):
            print("✅ Loading FAISS index from disk...")

            self.index = faiss.read_index("faiss_index.bin")
            self.embeddings = np.load("embeddings.npy")
            self.embed_model = SentenceTransformer("all-MiniLM-L6-v2")

            with open("documents.pkl", "rb") as f:
                self.documents = pickle.load(f)

        else:
            print("⚡ Building FAISS index (first time)...")

            df = pd.read_excel(r"D:\ChatBotAI\backend\app\core\GNX_Data_070426.xlsx")
            self.documents = dataframe_to_documents(df)

            self.index, self.embeddings, self.embed_model = build_faiss_index(self.documents)

            faiss.write_index(self.index, "faiss_index.bin")
            np.save("embeddings.npy", self.embeddings)

            with open("documents.pkl", "wb") as f:
                pickle.dump(self.documents, f)
        
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
        
    def search(self, query, top_k=50):
        query_embedding = self.embed_model.encode([query])
        query_embedding = np.array(query_embedding).astype("float32")

        distances, indices = self.index.search(query_embedding, top_k)

        return [self.documents[i] for i in indices[0]]
    
    async def generate_response(self, query: str,request: Request): 
        logging.info(f"Getting DataFrames from the RAG.")
       
        # df = pd.read_excel(r"D:\ChatBotAI\backend\app\core\GNX_Data_070426.xlsx")
        # sample_df = self.dataframe_to_documents(df)
        # emding = self.build_faiss_index(sample_df)
        # print(emding)
        # print("df",df[0:5])

        # Clean + limit (VERY IMPORTANT)
        # df = df.fillna(0)
        
        # df_small = df.head(100)

        # # Convert to JSON format
        # loan_data_json = df_small.to_dict(orient="records")
       
        retrieved_docs = self.search(query)

        context = "\n".join(retrieved_docs)
        # print("context",context)
        logging.info(f"Invoking LLM with query: {query}")
        response = self.llm_chain.invoke({"loan_data": context,
                                                        "question": query})
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

        # # Check for code blocks to decide the response strategy
        # llm_output = re.findall(r"```(?:json\n)?(.*?)```", llm_response_content, re.DOTALL)
        llm_output = llm_response_content
        print("llm_output",llm_output)
        if llm_output:
            formatted_output = json.loads(llm_output)
        else:
            # formatted_output = {}

        
            # No code found, return the conversational response directly
            logging.info("No code blocks found. Returning conversational response.")
            return ChatResponse(
                text_answer=llm_response_content,
                execution_results={},
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost_estimate_usd=round(cost_estimate_usd, 6),
            )

       

        return ChatResponse(
            text_answer="data_story",
            execution_results=formatted_output,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_estimate_usd=round(cost_estimate_usd, 6),
        )

       


def get_llm_service(_type: Optional[str] = None) -> LLMService:
    """Factory function to get LLM service instance"""
    # The LLM chain will now use our specific system prompt
    llm_chain = get_llm_chain()
    
    return LLMService(
        llm_chain=llm_chain,
        
    )
