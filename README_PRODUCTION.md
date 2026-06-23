# Deploy Production - Creatycios

Pasos rapidos:
1. Configurar DNS apuntando creatycios.com y www.creatycios.com a la IP del servidor.
2. Copiar este repo al servidor en /opt/creatycios.
3. Editar .env.prod en el servidor con credenciales reales.
4. Ejecutar ./deploy/bootstrap.sh (prepara Docker, certbot).
5. Ejecutar ./deploy/deploy.sh para levantar containers.
6. Verificar en https://creatycios.com

Revisa README.md para detalles.
