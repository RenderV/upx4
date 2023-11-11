import os
import subprocess
import time

def try_and_retry(command: list, max_attempts: int, interval: int = 3) -> None:
    for i in range(max_attempts):
        try:
            subprocess.check_output(command)
            break
        except Exception as e:
            print(f"Error: {e}\n\n")
            if(i+1 <= max_attempts):
                print(f"Trying again in 4 seconds [attempt {i+1}/{max_attempts}]")
                time.sleep(interval)
            else:
                print("Max retries reached.")
                raise e

def main():
    try_and_retry(["python", "manage.py", "makemigrations"], max_attempts=5)
    try_and_retry(["python", "manage.py", "migrate"], max_attempts=3)
    try_and_retry(["python", "manage.py", "runserver",  "0.0.0.0:8000"], max_attempts=1)

if(__name__ == '__main__'):
    main()