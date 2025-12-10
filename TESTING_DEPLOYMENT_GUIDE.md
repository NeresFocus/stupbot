# 🧪 TESTING & DEPLOYMENT GUIDE

## Part 1: Unit Testing

### test_agents.py - Complete Test Suite

```python
import pytest
import asyncio
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))

from agent_loader import AgentLoader
from agent_base import BaseAgent
from llm_config import MockLLMClient, get_llm_client

class TestAgentLoader:
    '''Test Agent Configuration Loading'''

    def test_loader_initialization(self):
        '''Test loader initializes correctly'''
        loader = AgentLoader("agents")
        assert loader is not None

    def test_load_agente_001(self):
        '''Test loading AGENTE_001 config'''
        loader = AgentLoader("agents")
        config = loader.load_agent_config("AGENTE_001")

        assert config is not None
        assert "logic" in config
        assert "prompts" in config
        assert "models" in config
        assert "tools" in config
        assert "workflow" in config

    def test_config_caching(self):
        '''Test that configs are cached'''
        loader = AgentLoader("agents")

        config1 = loader.load_agent_config("AGENTE_001")
        config2 = loader.load_agent_config("AGENTE_001")

        assert config1 is config2  # Same object

class TestBaseAgent:
    '''Test Base Agent Functionality'''

    @pytest.fixture
    def agent_config(self):
        loader = AgentLoader("agents")
        return loader.load_agent_config("AGENTE_001")

    @pytest.fixture
    def agent(self, agent_config):
        return BaseAgent("AGENTE_001", agent_config)

    def test_agent_initialization(self, agent):
        '''Test agent initializes correctly'''
        assert agent.agent_id == "AGENTE_001"
        assert agent.config is not None

    def test_logic_execution(self, agent):
        '''Test logic tree execution'''
        user_input = {
            "company_name": "Test",
            "revenue": 100000,
            "growth_rate": 0.15
        }

        result = agent.execute_logic(user_input)
        assert isinstance(result, str)
        assert len(result) > 0

    def test_prompt_building(self, agent):
        '''Test 4-layer prompt building'''
        user_input = "How to grow 3x?"
        prompts = agent.build_prompts(user_input)

        assert "system" in prompts
        assert "context" in prompts
        assert "instruction" in prompts
        assert "output_format" in prompts

        for key, value in prompts.items():
            assert isinstance(value, str)

    @pytest.mark.asyncio
    async def test_complete_workflow(self, agent):
        '''Test complete agent workflow'''
        llm_client = MockLLMClient()

        user_input = {
            "company_name": "TestCorp",
            "revenue": 100000,
            "objective": "3x growth"
        }

        result = await agent.execute(user_input, llm_client)

        assert result["status"] == "success"
        assert result["agent_id"] == "AGENTE_001"
        assert "duration" in result
        assert result["duration"] > 0

class TestLLMClients:
    '''Test LLM Client Implementations'''

    @pytest.mark.asyncio
    async def test_mock_llm_client(self):
        '''Test mock LLM client'''
        client = MockLLMClient()

        response = await client.create_message(
            system_prompt="You are helpful",
            user_prompt="Hello"
        )

        assert isinstance(response, str)
        assert len(response) > 0

# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
```

## Part 2: Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run all tests
pytest tests/ -v

# Run specific test
pytest tests/test_agents.py::TestBaseAgent::test_logic_execution -v

# Run with coverage
pip install pytest-cov
pytest tests/ --cov=src --cov-report=html
```

## Part 3: Integration Testing

### test_integration.py

```python
import pytest
import asyncio
from agent_loader import AgentLoader
from agent_base import BaseAgent
from llm_config import MockLLMClient

@pytest.mark.asyncio
async def test_agente_001_complete_flow():
    '''Test AGENTE_001 complete flow'''

    # Load
    loader = AgentLoader("agents")
    config = loader.load_agent_config("AGENTE_001")

    # Create
    agent = BaseAgent("AGENTE_001", config)

    # Input
    user_input = {
        "company_name": "TechCorp",
        "revenue": 500000,
        "growth_rate": 0.12,
        "objective": "3x growth in 12 months"
    }

    # Execute
    llm_client = MockLLMClient()
    result = await agent.execute(user_input, llm_client)

    # Verify
    assert result["status"] == "success"
    assert "response" in result
    assert result["duration"] < 60  # Should complete in under 60s

@pytest.mark.asyncio
async def test_all_agents_load():
    '''Test that all agents can be loaded'''

    loader = AgentLoader("agents")
    agents = loader.get_all_agents()

    for agent_info in agents:
        agent_id = agent_info["id"]
        config = loader.load_agent_config(agent_id)
        assert config is not None
```

## Part 4: Performance Testing

### test_performance.py

```python
import pytest
import asyncio
import time
from agent_loader import AgentLoader
from agent_base import BaseAgent
from llm_config import MockLLMClient

@pytest.mark.asyncio
async def test_agente_001_performance():
    '''Test AGENTE_001 execution time'''

    loader = AgentLoader("agents")
    config = loader.load_agent_config("AGENTE_001")
    agent = BaseAgent("AGENTE_001", config)
    llm_client = MockLLMClient()

    user_input = {"company_name": "Test", "revenue": 100000}

    start = time.time()
    result = await agent.execute(user_input, llm_client)
    duration = time.time() - start

    print(f"\nAGENTE_001 execution time: {duration:.2f}s")
    assert duration < 30  # Should complete in under 30 seconds

@pytest.mark.asyncio
async def test_concurrent_agents():
    '''Test running multiple agents concurrently'''

    loader = AgentLoader("agents")
    llm_client = MockLLMClient()

    agents_to_test = ["AGENTE_001", "AGENTE_002"]

    async def run_agent(agent_id):
        config = loader.load_agent_config(agent_id)
        agent = BaseAgent(agent_id, config)
        user_input = {"company_name": "Test"}
        return await agent.execute(user_input, llm_client)

    start = time.time()
    results = await asyncio.gather(*[run_agent(aid) for aid in agents_to_test])
    duration = time.time() - start

    print(f"\nConcurrent execution time: {duration:.2f}s")
    assert len(results) == len(agents_to_test)
    assert all(r["status"] == "success" for r in results)
```

## Part 5: Deployment - Docker

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Set environment
ENV PYTHONUNBUFFERED=1
ENV LOG_LEVEL=INFO

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import sys; sys.exit(0)"

# Run
CMD ["python", "main.py"]
```

### Build & Run Docker

```bash
# Build
docker build -t stupbot-agents:latest .

# Run
docker run -e OPENAI_API_KEY=your_key -p 8000:8000 stupbot-agents:latest

# Run with volume
docker run -v $(pwd)/agents:/app/agents \
           -e OPENAI_API_KEY=your_key \
           stupbot-agents:latest
```

## Part 6: Deployment - Kubernetes

### kubernetes/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stupbot-agents
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stupbot-agents
  template:
    metadata:
      labels:
        app: stupbot-agents
    spec:
      containers:
      - name: agents
        image: stupbot-agents:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 8000
          name: http
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: llm-secrets
              key: openai-key
        - name: LOG_LEVEL
          value: "INFO"
        - name: LLM_PROVIDER
          value: "openai"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          exec:
            command:
            - python
            - -c
            - "import sys; sys.exit(0)"
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          exec:
            command:
            - python
            - -c
            - "import sys; sys.exit(0)"
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: stupbot-agents-service
spec:
  selector:
    app: stupbot-agents
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000
  type: LoadBalancer
---
apiVersion: v1
kind: Secret
metadata:
  name: llm-secrets
type: Opaque
stringData:
  openai-key: "your-api-key-here"
```

### Deploy to Kubernetes

```bash
# Apply deployment
kubectl apply -f kubernetes/deployment.yaml

# Check status
kubectl get pods -l app=stupbot-agents
kubectl logs deployment/stupbot-agents

# Scale
kubectl scale deployment stupbot-agents --replicas=5

# Delete
kubectl delete deployment stupbot-agents
```

## Part 7: Quick Start Script

### run_all_tests.sh

```bash
#!/bin/bash

echo "🧪 Running Agent Tests..."
echo "======================================"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run tests
echo "\n1. Unit Tests"
pytest tests/test_agents.py -v

echo "\n2. Integration Tests"
pytest tests/test_integration.py -v

echo "\n3. Performance Tests"
pytest tests/test_performance.py -v

echo "\n4. Example Run"
python example_agente_001.py

echo "\n✅ All tests completed!"
```

## Part 8: Continuous Integration (GitHub Actions)

### .github/workflows/test.yml

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: [3.9, 3.10, 3.11]

    steps:
    - uses: actions/checkout@v2

    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: ${{ matrix.python-version }}

    - name: Install dependencies
      run: |
        pip install -r requirements.txt
        pip install pytest pytest-asyncio pytest-cov

    - name: Run tests
      run: pytest tests/ -v --cov=src

    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

## Part 9: Monitoring & Logging

```python
# monitoring.py
import time
from loguru import logger
from datetime import datetime

class ExecutionMonitor:
    def __init__(self):
        self.metrics = []

    def record_execution(self, agent_id, duration, status):
        metric = {
            "agent_id": agent_id,
            "duration": duration,
            "status": status,
            "timestamp": datetime.now()
        }
        self.metrics.append(metric)
        logger.info(f"[METRICS] {agent_id}: {duration:.2f}s - {status}")

    def get_stats(self):
        if not self.metrics:
            return {}

        total = len(self.metrics)
        successful = sum(1 for m in self.metrics if m["status"] == "success")
        avg_duration = sum(m["duration"] for m in self.metrics) / total

        return {
            "total": total,
            "successful": successful,
            "success_rate": successful/total*100,
            "avg_duration": avg_duration
        }
```

## Summary

Testing & Deployment Steps:
1. ✅ Write unit tests
2. ✅ Write integration tests
3. ✅ Run performance tests
4. ✅ Build Docker image
5. ✅ Test in Docker
6. ✅ Deploy to Kubernetes
7. ✅ Monitor & log
8. ✅ Scale as needed

All ready for production!
