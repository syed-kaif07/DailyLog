#base image
FROM python:3.12

#workdir
WORKDIR /app

#copy cmd
COPY . /app

#run req cmd
RUN pip install -r requirements.txt

#port
EXPOSE 8000

#command
CMD ["python","run.py"]