import os
import re

def extract_jsdoc_and_functions(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Improved regex pattern to match JSDoc comments and the following function definition
        pattern = re.compile(r'(/\*\*[\s\S]*?\*/)\s*(?:export\s+)?function\s+(\w+)\s*\(', re.MULTILINE)
        matches = pattern.findall(content)
        
        print(f"Extracted {len(matches)} functions from {file_path}")
        return matches
    except Exception as e:
        print(f"Error processing file {file_path}: {e}")
        return []

def generate_functions_md(source_dir, output_file):
    all_jsdoc_functions = {}
    
    # Walk through the source directory to find TypeScript files
    for root, _, files in os.walk(source_dir):
        for file in files:
            if file.endswith('.ts'):
                file_path = os.path.join(root, file)
                functions = extract_jsdoc_and_functions(file_path)
                if functions:
                    all_jsdoc_functions[file_path] = functions
    
    # Generate the content for functions.md
    md_content = "# Functions Documentation\n\n"
    
    for file_path, functions in all_jsdoc_functions.items():
        if functions:
            md_content += f"## {os.path.relpath(file_path, source_dir)}\n"
            for jsdoc, function_name in functions:
                md_content += f"### {function_name}\n"
                md_content += f"{jsdoc}\n\n"
    
    try:
        # Write the functions.md file
        with open(output_file, 'w', encoding='utf-8') as md_file:
            md_file.write(md_content)
        print(f"Documentation successfully written to {output_file}")
    except Exception as e:
        print(f"Error writing to file {output_file}: {e}")

# Define source directory and output file
source_directory = os.path.join(os.getcwd(), 'source')
output_file = os.path.join(os.getcwd(), 'functions.md')

# Generate the functions.md file
generate_functions_md(source_directory, output_file)
