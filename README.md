# API

Este repositorio contiene la API que permitirá realizar conexiones con nuestro Cluster en MongoDB. Aqui se definirán diferentes Endpoints para controlar las acciones y peticiones desde diferentes URLs.

Nota: Los parámetros de los Endpoints utilizan el principio de las URL Query: `?param=value`

<br/>Para realizar el login desde la App:
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


<br/>Para guardar el token:
<table>
  <tr>
    <th colspan="3" >Post /token</th>
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

