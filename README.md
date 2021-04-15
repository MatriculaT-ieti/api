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
Los siguientes dos endpoints realizan el proceso necesario para el login de usuarios y administradores, respectivamente. Dichos endpoints necesitan un email y una password, y nuestra api les acredita un token de acceso con el rol admin o user dependiendo su perfil. En caso de no encontrar el email pasado como parámetro el objeto JSON que se devuelve será nulo.

<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/login/students</th>
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
    <th colspan="4" >Get /api/login/admins</th>
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

#### CRUD Cycles MongoDB

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

<table>
  <tr>
    <td>Filter by</td>
    <td>codi_cicle_formatiu, nom_cicle_formatiu</td>
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

Para importar un documento csv existente en la base de datos (<b>Import</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >POST /api/db/cycles/import</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>File</td>
    <td>File</td>
    <td>The path of your <b> CSV </b> file</td>
    <td>Yes</td>
  </tr>
</table>

#### CRUD Student MongoDB

Los siguientes 4 endpoints realizan el proceso que le corresponde en la colección especificada (Create, Read, Update, Delete):
- `Get /api/db/student/create` permite añadir nuevos documentos a la base de datos. 
- `Get /api/db/student/read` permite obtener diferentes documentos de la base de datos. 
- `Get /api/db/student/update` permite actualizar documentos ya existentes en la base de datos. 
- `Get /api/db/student/delete` permite eliminar documentos de la base de datos.  

Para añadir documentos a la colección (<b>Create</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >POST /api/db/student/create</th>
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
    <th colspan="4" >Get /api/db/student/read</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>cicle_formatiu</td>
    <td>String</td>
    <td>Selects only one document. If this Id is present <br/> the <b>Range</b> parameter will be ignored.</td>
    <td>Yes</td>
  </tr>
</table>


Para actualizar un documento ya existente en la base de datos (<b>Update</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >POST /api/db/student/update</th>
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
</table>

 <table>
   <tr>
      <td>Possibilities to update</td>
      <td>Convocatioria, Codi_solicitud, Tipus_solicitud, Estat_solicitud, Nom, Primer Cognom, Segon Cognom, Identificador_RALC, Tipus_alumne, Codi_centre_p1, nom_centre_p1, naturalesa_centre_p1, municipi_centre_p1, SSTT_centre_p1, codi_ensenyament, cicle_formatiu, codi_modalitat, modalitat, curs_p1, regim_p1, torn_p1, DNI, nie, pass, data_naixament, sexe, nacionalitat, Pais Naixament, municipi_naixament, Tipus via, Nom via, Número via, altres_dades, provincia_residencia, Municipi residència, localitat_residencia, cp, pais_residencia, Telèfon, Correu electrònic, tipus_doc_tutor1, num_doc_tutor1, primer_cognom_tutor1,  segon_cognom_tutor1, tipus_doc_tutor2, num_doc_tutor2, nom_tutor2, primer_cognom_tutor2, segon_cognom_tutor2, codi_centre_proc, nom_centre_proc, codi_ensenyament_proc, nom_ensenyament_proc, curs_proc, llengua_enten, religio, centre_asignat
     </td>
    </tr>
 </table>

Para borrar un documento existente en la base de datos (<b>Delete</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/student/delete</th>
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

Para importar un documento csv existente en la base de datos (<b>Import</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >POST /api/db/student/import</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>File</td>
    <td>File</td>
    <td>The path of your <b> CSV </b> file</td>
    <td>Yes</td>
  </tr>
</table>

#### Endpoint Importar UF's admeses
Para importar las UF's que esta cursando el alumno en la base de datos (<b>Import</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/student/import/ufs</th>
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
    <td>Contains the email of the student</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>JSON</td>
    <td>JSON {cursando: modulos: [ unidades:[ ] ]}</td>
    <td>JSON information</td>
    <td>Yes</td>
  </tr>
</table>

#### CR Requeriments

Los siguientes 2 endpoints realizan el proceso que le corresponde en la colección especificada (Create, Read):
- `Get /api/db/requirements/create` permite añadir nuevos documentos a la base de datos. 
- `Get /api/db/requirements/read` permite obtener diferentes documentos de la base de datos. 

Para añadir documentos a la colección (<b>Create</b>):
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/requirements/create</th>
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
    <th colspan="4" >POST /api/db/requirements/read</th>
  </tr>
</table>


#### CR Requirements Validation


Para validar documentos a la colección:
<table>
  <tr>
    <th colspan="4" >Response: JSON</th>
  </tr>
  <tr>
    <th colspan="4" >Get /api/db/requirements/validation</th>
  </tr>
  <tr>
    <th>Param</th>
    <th>Values</th>
    <th>Description</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>DNI</td>
    <td>String</td>
    <td>DNI student</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Tipo</td>
    <td>String</td>
    <td>Type of requirement</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Valido</td>
    <td>Integer</td>
    <td>We are going to pass him, 0 if it is denied, 1 if it is on hold and 2 if it is accepted</td>
    <td>Yes</td>
  </tr>
</table>
