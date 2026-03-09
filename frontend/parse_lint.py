import json

try:
    with open('lint_results.json', 'r', encoding='utf-16') as f:
        data = json.load(f)
        
    for file_result in data:
        if file_result['errorCount'] > 0 or file_result['warningCount'] > 0:
            print(f"File: {file_result['filePath']}")
            for msg in file_result['messages']:
                print(f"  Line {msg['line']}:{msg['column']} - {msg['ruleId']} - {msg['message']}")
except Exception as e:
    print(f"Error: {e}")
