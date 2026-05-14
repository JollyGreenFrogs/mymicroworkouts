FROM 10.0.27.50:5005/jgf-python-base:3.12

WORKDIR /app

# System deps needed to build psycopg2
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8787

# Run migrations then start the server
CMD ["sh", "-c", "jgf-auth-db upgrade head && uvicorn main:app --host 0.0.0.0 --port 8787"]
