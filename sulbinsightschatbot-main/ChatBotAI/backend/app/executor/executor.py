import subprocess
import uuid
import os
import shutil
import tempfile
import logging
import traceback
import re

from executor.validator import validate_code

# Initialize logger
logger = logging.getLogger(__name__)

# Base temporary directory where execution folders will be created
BASE_TEMP = os.path.join(tempfile.gettempdir(), "llm_exec")

# Limit output size to prevent memory issues
MAX_OUTPUT_SIZE = 1_000_000

# Ensure base directory exists
os.makedirs(BASE_TEMP, exist_ok=True)


def extract_python_code(llm_response: str):
    """
    Extract Python code block from LLM response.

    The LLM usually returns code wrapped inside:
    ```python
    code here
    ```

    This function extracts only the code part.
    """

    code_blocks = re.findall(r"```(?:python\n)?(.*?)```", llm_response, re.DOTALL)

    if code_blocks:
        code = code_blocks[0].strip()
        logger.info("Python code block extracted from LLM response")
        return code

    logger.warning("No code block found, using full response as code")
    return llm_response.strip()


def prepare_datasets(folder, execution):
    """
    Save pandas DataFrames as CSV files inside the execution folder.

    These CSV files will be mounted into the Docker container
    so the script inside the container can read them.
    """

    logger.info("Preparing datasets for execution")

    for name, df in execution.items():
        path = os.path.join(folder, f"{name}.csv")

        df.to_csv(path, index=False)

        logger.info(f"Dataset saved: {name}.csv")


def build_script(llm_code):

    loader_code = """
import os
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["OMP_NUM_THREADS"] = "1"

import pandas as pd
import numpy as np

import plotly.express as px
import plotly
import json
import sys

# Load datasets
loan_data = pd.read_csv("LOAN_DATA.csv")

fig = None
final_df = None
data_story = None
"""

    result_capture = """

result = {
    "plotly_json": None,
    "final_df": None,
    "data_story": data_story
}

if fig is not None:
    result["plotly_json"] = fig.to_json()

if isinstance(final_df, pd.DataFrame):
    result["final_df"] = final_df.to_dict(orient="split")

print("__RESULT_START__")
print(json.dumps(result))
print("__RESULT_END__")
"""

    return loader_code + "\n\n" + llm_code + "\n\n" + result_capture


def run_code(llm_response: str, execution: dict):
    """
    Main executor function.

    Steps:
    1. Extract Python code from LLM response
    2. Validate the code for security
    3. Prepare datasets
    4. Create execution script
    5. Run script inside Docker sandbox
    6. Capture output safely
    """

    # Extract Python code
    llm_code = extract_python_code(llm_response)

    # Validate code before execution
    # try:
    #     validate_code(llm_code)

    # except ValueError as e:
    #     logger.warning(f"Security validation failed: {str(e)}")

    #     return {
    #         "stdout": "",
    #         "stderr": str(e)
    #     }

    # Unique execution ID
    job_id = str(uuid.uuid4())
    container_name = f"sandbox_{job_id}"

    logger.info(f"[{job_id}] Execution started")

    # Create temporary execution folder
    folder = os.path.join(BASE_TEMP, job_id)

    try:

        os.makedirs(folder, exist_ok=True)

        logger.info(f"[{job_id}] Temporary folder created")

        # Save datasets
        prepare_datasets(folder, execution)

        # Build final script
        script = build_script(llm_code)

        script_path = os.path.join(folder, "script.py")

        with open(script_path, "w") as f:
            f.write(script)

        logger.info(f"[{job_id}] Script written to {script_path}")

        # Docker command
        cmd = [
            "docker", "run",
            "--rm",
            "--name", container_name,

            # Disable networking for security
            "--network", "none",

            # Resource limits
            "--memory", "512m",
            "--cpus", "1",
            "--pids-limit", "256",
            "-e", "OPENBLAS_NUM_THREADS=1",
            "-e", "OMP_NUM_THREADS=1",
            "-e", "NUMEXPR_NUM_THREADS=1",
            "-e", "MKL_NUM_THREADS=1",


            # Read-only filesystem
            "--read-only",
            "--tmpfs", "/tmp",

            # Security restrictions
            "--security-opt", "no-new-privileges",
            "--cap-drop", "ALL",

            # Run as non-root
            "--user", "1000:1000",

            # Mount execution folder
            "-v", f"{os.path.abspath(folder)}:/app:ro",

            # Working directory
            "-w", "/app",

            # Docker image
            "python-sandbox",

            # Command to run
            "python", "script.py"
        ]

        logger.info(f"[{job_id}] Launching Docker container")

        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )

        try:

            # Wait for process completion
            stdout, stderr = process.communicate(timeout=20)

            logger.info(f"[{job_id}] Execution finished")

        except subprocess.TimeoutExpired:

            logger.warning(f"[{job_id}] Execution timed out")

            process.kill()

            subprocess.run(
                ["docker", "rm", "-f", container_name],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL
            )

            return {
                "stdout": "",
                "stderr": "Execution timed out"
            }

        # Limit stdout size
        if stdout and len(stdout) > MAX_OUTPUT_SIZE:
            logger.warning(f"[{job_id}] Stdout truncated")
            stdout = stdout[:MAX_OUTPUT_SIZE] + "\n... truncated ..."

        # Limit stderr size
        if stderr and len(stderr) > MAX_OUTPUT_SIZE:
            logger.warning(f"[{job_id}] Stderr truncated")
            stderr = stderr[:MAX_OUTPUT_SIZE] + "\n... truncated ..."

        return {
            "stdout": stdout or "",
            "stderr": stderr or ""
        }

    except Exception:

        logger.error(f"[{job_id}] Executor failure")
        logger.error(traceback.format_exc())

        return {
            "stdout": "",
            "stderr": "Internal executor error"
        }

    finally:

        # Cleanup temporary folder
        try:
            shutil.rmtree(folder, ignore_errors=True)

            logger.info(f"[{job_id}] Temporary folder cleaned")

        except Exception as cleanup_error:
            logger.error(f"[{job_id}] Cleanup failed: {cleanup_error}")