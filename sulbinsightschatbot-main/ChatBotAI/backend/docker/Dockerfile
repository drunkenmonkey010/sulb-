FROM python:3.12-slim

# Python settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_PROGRESS_BAR=off

# Upgrade pip
RUN pip install --upgrade pip

# Install required Python packages
RUN pip install --no-cache-dir \
    pandas \
    numpy \
    plotly \
    matplotlib \
    jsonschema \
    python-dateutil \
    pytz

# Create non-root user for security
RUN useradd -m sandboxuser

# Set working directory
WORKDIR /app

# Switch to non-root user
USER sandboxuser

# Default command
CMD ["python", "script.py"]