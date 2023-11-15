import subprocess, time
import logging
logging.basicConfig(level=logging.DEBUG)
def try_and_retry(n_attempts, delay):
    for i in range(n_attempts):
        try:
            logging.warning("trying to make migrations")
            subprocess.call(['python', 'manage.py', 'makemigrations'])
            logging.warning("trying to migrate")
            subprocess.call(['python', 'manage.py', 'migrate'])
            logging.warning("trying to runserver")
            subprocess.call(['python', 'manage.py', 'runserver', "0.0.0.0:8000"])
            break
        except Exception as e:
            logging.warning("Error: ", e)
            logging.warning("Retrying in {} seconds".format(delay))
            time.sleep(delay)

if __name__ == "__main__":
    logging.warning("Starting server")
    try_and_retry(10, 1)