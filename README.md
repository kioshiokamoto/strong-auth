![strong-auth](https://socialify.git.ci/kioshiokamoto/strong-auth/image?description=1&font=Raleway&language=1&logo=https%3A%2F%2Fnext-auth.js.org%2Fimg%2Flogo%2Flogo-sm.png&owner=1&pattern=Charlie%20Brown&theme=Light)

# Strong User Auth

Aplicación de registro, inicio de sesión y perfil de usuario con JWT
Funciones:

- Registro: Se crea usuario en base de datos en estado `deshablitado`, se envía correo a usuario para que habilite su cuenta.
  - Beneficio: Evita spam de registro
- Envio de correo de verificación: En caso el token que se envia al correo en el registro halla vencido, permite el envío de otro token.
- Activar cuenta: Al hacer click sobre enlace enviado a correo el estado del usuario pasa a `habilitado`
- Inicio de sesión: Valida información de usuario, registra `refresh token` cookie y envia `access token` a frontend.
- Obtener access token: En caso el `access token` venza, puede solicitar otro a través del `refresh token` previamente almacenado
- Olvide contraseña: En caso se haya olvidado la contraseña, se puede enviar un correo electronico con un `access_token` para el reseteo.
- Reseteo de contraseña: Permite el cambio de contraseña.
- Deshabilitar cuenta: En caso el usuario quiera dejar de utilizar la aplicacion puede deshabilitar su cuenta.
- Cerrar sesión: Elimina `refresh token` de cookies
- Obtener informacion de usuario: Funcionalidad para recuperar datos de usuario de la base de datos.
- Actualizar informacion de usuario: Funcionalidad para poder cambiar el nombre y avatar de usuario.

## Tech Stack

**Backend:** Nest, TypeORM, Postgres

## Screenshots

![App Screenshot](https://github.com/kioshiokamoto/strong-auth/blob/main/screens/screen_1.JPG?raw=true)

## Ejecutar localmente

Clonar proyecto

```bash
  git clone https://github.com/kioshiokamoto/strong-auth
```

Ir a ruta de proyecto

```bash
  cd strong-auth
```

Instalar dependencias

```bash
  npm install
```

<strong>Debe actualizar variables de entorno</strong>

Iniciar servidor

```bash
  npm run start
```

### License

[MIT](https://choosealicense.com/licenses/mit/)
