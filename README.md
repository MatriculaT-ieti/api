# API

#### IMPORTANTE: al hacer `git clone` instalar los paquetes necesarios con: `npm install`

Este repositorio contiene la API que permitirá realizar conexiones con nuestro Cluster en MongoDB. Aqui se definirán diferentes endpoints para controlar las acciones y peticiones desde diferentes URLs.

Nota: Los parámetros de los endpoints utilizan el principio de las URL Query: `?param=value`

## Endpoints:

#### Test
El siguiente endpoint es un test sencillo para comprovar que el servicio de la API funciona correctamente. Devuelve un json con un status `ok` o `failed`.

<table>
  <tr>
    <th>Response: JSON</th>
  </tr>
  <tr>
    <th>Get / </th>
  </tr>
  <tr>
    <td>No parameters required</td>
  </tr>
</table>

#### Login
Los siguientes dos endpoints realizan el proceso necesario para el login de usuarios y administradores, respectivamente. Dichos endpoints necesitan un email y una password, y nuestra api les acredita un token de acceso con el rol admin o user dependiendo su perfil. En caso de no encontrar un usuario con email y password válido en la base de datos el token del objeto JSON sera nulo.

<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/login/students{email}</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>email</td>
    <td>String</td>
    <td>Contains the email of the user</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>password</td>
    <td>String</td>
    <td>Contains the Password of the user</td>
    <td>Yes</td>
  </tr>
</table>

<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/login/admins{email}</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>email</td>
    <td>String</td>
    <td>Contains the email of the admin</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>password</td>
    <td>String</td>
    <td>Contains the Password of the admin</td>
    <td>Yes</td>
  </tr>
</table>

#### CRUD MongoDB

Los siguientes 4 endpoints realizan el proceso que le corresponde en la colección especificada (Create, Read, Update, Delete):
- `Get /api/db/cycles/create` permite añadir nuevos documentos a la base de datos. 
- `Get /api/db/cycles/read` permite obtener diferentes documentos de la base de datos. 
- `Get /api/db/cycles/update` permite actualizar documentos ya existentes en la base de datos. 
- `Get /api/db/cycles/delete` permite eliminar documentos de la base de datos.  

Para añadir documentos a la colección (<b>Create</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/cycles/create</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>Document</td>
    <td>JSON {field: value, ...}</td>
    <td>Adds the document passed as a parameter. Only one <br/>document can be inserted at a time.</td>
    <td>Yes</td>
  </tr>
</table>

Para obtener datos de la colección en formato JSON (<b>Read</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/cycles/read</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>Id</td>
    <td>Integer</td>
    <td>Selects only one document. If this Id is present <br/> the <b>Range</b> parameter will be ignored.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Range</td>
    <td>JSON {from: 0, to: 10}</td>
    <td>Selects a range of documents ordered by an internal id</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Filter</td>
    <td>JSON {field: filter, ...}</td>
    <td>Selects a group of documents that matches with the filter</td>
    <td>No</td>
  </tr>
</table>

Para actualizar un documento ya existente en la base de datos (<b>Update</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/cycles/update</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>Document</td>
    <td>JSON {field: value, ...}</td>
    <td>Updates an existing document with the same id. If there's no document with the same id it doesn't make any change.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Filter</td>
    <td>JSON {field: filter, ...}</td>
    <td>Selects a group of documents that matches with the filter</td>
    <td>No</td>
  </tr>
</table>

Para borrar un documento existente en la base de datos (<b>Delete</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/cycles/delete</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>Id</td>
    <td>Integer</td>
    <td>Selects only one document. If this id is present <br/> the <b>Range</b> parameter will be ignored. If id </td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Range</td>
    <td>JSON {from: 0, to: 10}</td>
    <td>Selects a range of documents ordered by an internal id</td>
    <td>Yes</td>
  </tr>
 </table>
  
Para importar, transformando a documento JSON, un csv en la base de datos (<b>Import</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/cycles/import</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>File</td>
    <td>JSON</td>
    <td>The path of your <b> CSV </b> file</td>
    <td>Yes</td>
  </tr>
</table>

