import os
import zipfile

def make_zip(output_filename="ai-travel-planner.zip"):
    exclude_dirs = {"node_modules", ".git", "dist", "__pycache__", ".pytest_cache", "venv", ".vite"}
    exclude_files = {output_filename, "trips.db"}

    with zipfile.ZipFile(output_filename, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if file in exclude_files or file.endswith(".pyc") or file.endswith(".swp"):
                    continue
                if file.startswith(".") and file not in [".env.example", ".gitignore"]:
                    continue

                full_path = os.path.join(root, file)
                # Ensure normalized forward slashes for Windows compatibility
                rel_path = os.path.relpath(full_path, ".").replace("\\", "/")
                
                # Create ZipInfo to preserve permissions and standard format
                zinfo = zipfile.ZipInfo.from_file(full_path, rel_path)
                zinfo.compress_type = zipfile.ZIP_DEFLATED
                with open(full_path, "rb") as f:
                    zipf.writestr(zinfo, f.read())

    print(f"Archive {output_filename} successfully written. Size: {os.path.getsize(output_filename)} bytes")

if __name__ == "__main__":
    make_zip()
