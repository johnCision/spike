
notes on files that exist in local direcotry `./secrets` for http servie operation


## these command used for https/2
```cmd
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost:<port?>' \
  -keyout localhost-privkey.pem -out localhost-cert.pem
```

```cmd
	openssl pkcs12 -export -in localhost-cert.pem  -inkey localhost-privkey.pem -out output.pfx
```

```cmd
	sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain localhost-cert.pem
```

## used to ceate JWT keys

```cmd
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```
or
```cmd
ssh-keygen -t rsa -P "" -b 4096 -m PEM -f jwtRS256.key
ssh-keygen -e -m PEM -f jwtRS256.key > jwtRS256.key.pub
```