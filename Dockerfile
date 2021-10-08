FROM node:10-alpine

RUN npm -g config set user root

RUN npm install -g drakov

WORKDIR /mock

EXPOSE 3000

ENTRYPOINT ["drakov", "--public"]

CMD ["--help"]
