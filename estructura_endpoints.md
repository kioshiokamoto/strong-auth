Tabla usuario tiene:
- names
- mail
- password (cifrada)
- is_enabled (boolean), default 0
--Pueden ser null
- avatar
- phone (futuramente implementar 2FA)

<hr />

- Ruta de registro
  Se debe enviar en body:
  - nombres
  - correo
  - contraseña
  Al hacer post se envia un correo para que cambie el estado is_enabled a 1
- Ruta de reenvio de access_token para registro
- Ruta para activar usuario
- Ruta de login
  - Verifica datos y almacena cookies en cliente.
- Ruta get_accessToken
  - Si se esta logueado permitira obtener accessToken
- Ruta de olvide contraseña
  - Se envia correo con token con accessToken para cambiar contraseña
- Ruta de resetear contraseña
  - Recibe token y Se permite cambiar contraseña
- Actualizar perfil
  - Recibe token y Permite cambiar datos de usuario
- Obtener informacion de usuario
  - Recibe token y retorna informacion de usuario
- Cerrar sesion
- Deshabilitar cuenta
  - Recibe token y cambia estado de usuario is_enabled a 0

Futuro:
- Registro google
  - Similar a registro/login juntos
- Registro facebook
  - Similar a registro/login juntos
