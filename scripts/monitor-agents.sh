#!/bin/bash

# 📊 Agent Status Monitor
# Real-time monitoring of all 8 parallel agents

LOG_DIR="/tmp/agents-logs"

echo "📊 8-Parallel Agent Status Monitor"
echo "===================================="
echo ""

# Check if PIDs file exists
if [ ! -f "$LOG_DIR/agent-pids.txt" ]; then
  echo "❌ No agents running. Start with: bash scripts/parallel-agents.sh"
  exit 1
fi

PIDS=$(cat "$LOG_DIR/agent-pids.txt")
IFS=' ' read -ra PID_ARRAY <<< "$PIDS"

# Agent status check function
check_agent() {
  local agent_num=$1
  local pid=$2
  local name=$3
  
  if ps -p "$pid" > /dev/null 2>&1; then
    echo "🟢 Agent $agent_num ($name): RUNNING (PID: $pid)"
  else
    echo "🟢 Agent $agent_num ($name): COMPLETE"
    if [ -f "$LOG_DIR/agent${agent_num}-*.log" ]; then
      local log_size=$(du -h "$LOG_DIR/agent${agent_num}"*.log 2>/dev/null | tail -1 | cut -f1)
      echo "   📄 Log size: $log_size"
    fi
  fi
}

# Check all agents
check_agent 1 "${PID_ARRAY[0]}" "Linting"
check_agent 2 "${PID_ARRAY[1]}" "Type Checking"
check_agent 3 "${PID_ARRAY[2]}" "Integration Tests"
check_agent 4 "${PID_ARRAY[3]}" "Figma Extraction"
check_agent 5 "${PID_ARRAY[4]}" "Build Verification"
check_agent 6 "${PID_ARRAY[5]}" "Component Validation"
check_agent 7 "${PID_ARRAY[6]}" "Accessibility Audit"
check_agent 8 "${PID_ARRAY[7]}" "Design Tokens"

echo ""
echo "📁 Full logs available in: $LOG_DIR"
echo ""

# Show summary if all complete
all_complete=true
for pid in "${PID_ARRAY[@]}"; do
  if ps -p "$pid" > /dev/null 2>&1; then
    all_complete=false
    break
  fi
done

if [ "$all_complete" = true ]; then
  echo "✅ All agents have completed!"
  echo ""
  echo "📊 Quick Summary:"
  
  # Agent 1 summary
  if [ -f "$LOG_DIR/agent1-lint.log" ]; then
    if grep -q "error" "$LOG_DIR/agent1-lint.log"; then
      echo "⚠️  Agent 1: Linting issues found (check log)"
    else
      echo "✅ Agent 1: Linting passed"
    fi
  fi
  
  # Agent 2 summary
  if [ -f "$LOG_DIR/agent2-tsc.log" ]; then
    if grep -q "error" "$LOG_DIR/agent2-tsc.log"; then
      echo "⚠️  Agent 2: Type errors found (check log)"
    else
      echo "✅ Agent 2: Type checking passed"
    fi
  fi
  
  # Agent 6 summary
  if [ -f "$LOG_DIR/agent6-components.txt" ]; then
    echo "📊 Agent 6: $(cat "$LOG_DIR/agent6-components.txt")"
  fi
  
  # Agent 8 summary
  if [ -f "$LOG_DIR/agent8-tokens.txt" ]; then
    echo "🎨 Agent 8: $(cat "$LOG_DIR/agent8-tokens.txt" | grep -o '"uniqueTokens": [0-9]*' | grep -o '[0-9]*') design tokens found"
  fi
fi

