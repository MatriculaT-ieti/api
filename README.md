# API

Este repositorio contiene la API que permitirá realizar conexiones con nuestro Cluster en MongoDB. Aqui se definirán diferentes Endpoints para controlar las acciones y peticiones desde diferentes URLs.

Nota: Los parámetros de los Endpoints utilizan el principio de las URL Query: `?param=value`

<br/>Para realizar el login desde la App y agregar un token valido al usuario en el que se guardara todo su informacion:
<table>
  <tr>
    <th colspan="3" >Get /users</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>email</td>
    <td>String</td>
    <td>Contains the email of the user</td>
  </tr>
</table>


<br/>Para realizar el login desde la App y agregar un token valido al admin en el que se guardara todo su informacion:
<table>
  <tr>
    <th colspan="3" >Get /admins</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>email</td>
    <td>String</td>
    <td>Contains the email of the user</td>
  </tr>
</table>

