
notes on files that exist in local direcotry `./secrets` for http servie operation

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