# Apple/PayU: jeden Content-Type (podwójny text/plain psuje walidację).
location = /.well-known/apple-developer-merchantid-domain-association {
    types { }
    default_type application/octet-stream;
    charset off;
    alias /var/www/sofelio/deploy/apple-pay/apple-developer-merchantid-domain-association;
    add_header Cache-Control "no-store" always;
}

location = /.well-known/apple-developer-merchantid-domain-association/ {
    rewrite ^ /.well-known/apple-developer-merchantid-domain-association last;
}

location = /.well-known/apple-developer-merchantid-domain-association.txt {
    types { }
    default_type application/octet-stream;
    charset off;
    alias /var/www/sofelio/deploy/apple-pay/apple-developer-merchantid-domain-association;
    add_header Cache-Control "no-store" always;
}
