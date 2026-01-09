import json
import re
import os

config_map = {
    'Simplified': 't2s',
    'Traditional': 's2t',
    'China': 'tw2sp',
    'Hongkong': 's2hk',
    'Taiwan': 's2twp'
}

def parse_cases():
    cases_dict = {} # input -> {config: expected}
    source_path = '/Users/frank/Developer/opencc-wasm-demo-site/zhconvert_source.txt'
    
    if not os.path.exists(source_path):
        print(f"Error: {source_path} not found")
        return

    with open(source_path, 'r', encoding='utf-8') as f:
        current_config = None
        for line in f:
            line = line.strip()
            if not line: continue
            
            if line.startswith('- converter:'):
                name = line.split(':')[1].strip()
                current_config = config_map.get(name)
                continue
            
            if line.startswith('- [') and current_config:
                # Extract content inside brackets
                content = line[line.find('[')+1 : line.rfind(']')]
                # Split by first comma that is not inside quotes
                # But my source is simple [inp, exp], so we can split by ', '
                parts = content.split(', ')
                if len(parts) >= 2:
                    inp = parts[0].strip()
                    exp = parts[1].strip()
                    # Remove potential wrapping quotes
                    for q in ['"', '“', '”', '「', '」']:
                        if inp.startswith(q) and inp.endswith(q):
                            inp = inp[1:-1]
                        if exp.startswith(q) and exp.endswith(q):
                            exp = exp[1:-1]
                    
                    if inp not in cases_dict:
                        cases_dict[inp] = {}
                    cases_dict[inp][current_config] = exp

    final_cases = []
    # Use list order to keep it somewhat stable if we want, or just sort
    for i, (inp, expecteds) in enumerate(cases_dict.items(), 1):
        final_cases.append({
            "id": f"case_zhc_{i:03d}",
            "input": inp,
            "expected": expecteds
        })

    output_path = '/Users/frank/Developer/opencc-wasm-demo-site/src/testcases_zhconvert.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"cases": final_cases}, f, ensure_ascii=False, indent=2)
    
    print(f"Successfully generated {len(final_cases)} cases in {output_path}")

if __name__ == "__main__":
    parse_cases()
