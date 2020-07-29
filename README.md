# Shopear Genome: Procesamiento de datos de comportamiento para la conformación de un perfil psicográfico
### 2015
==============

## Descripción
Los sistemas de recomendación están cambiando, así como está cambiando el contexto en el que operan y las necesidades de los usuarios que son sus consumidores. Acompañando una tendencia general, la experiencia de los usuarios consumidores de aplicaciones web, mobile, en distintos dispositivos y circunstancias, exigen al menos un nuevo análisis para definir un sistema de recomendaciones que presente una rápida y precisa respuesta a sus necesidades en el cambiante contexto en el que son consultados.

El motor de recomendación de libros de Amazon, películas en Netflix, o música en Spotify, son buenos ejemplos de sistemas de recomendaciones que operan a gran escala diseñados para un dominio y una necesidad concreta, partiendo de las características particulares de un conjunto de información disponible.
El contexto y las personas que nos rodean, nuestro nivel de educación, los libros que leemos, el contenido multimedia que consumimos (y la forma en la que lo hacemos), la música que escuchamos y las películas que nos gustan, los sitios web que frecuentamos, las aplicaciones que consumimos, los tópicos que compartimos, éstas y otras interacciones son rasgos que arrojan información sobre nuestro perfil de intereses y comportamiento.

El motor de recomendaciones de Shopear (Genome) obtiene información de las redes sociales más utilizadas (*Facebook, Twitter, Google, Instagram, LinkedIn* y otras) para extraer conjuntos de información desnormalizada, particular y contextual, que nos permitirá, más adelante, conformar un perfil psicográfico de los gustos e intereses del usuario, al que llamaremos Genoma.

## Alcance del prototipo
El siguiente prototipo expone un análisis de la información obtenida de 10.000 usuarios registrados en *Shopear.com* a traves de Facebook. Además, permite observar un análisis en tiempo real para un usuario único conectando su cuenta en dicha red social. A partir del ingreso de datos, la información es normalizada, segmentada y devuelta de forma gráfica conformando un perfil psicográfico del usuario o la población de usuarios procesada.

El procesamiento de los intereses, gustos y datos del perfil procesado (y de todos aquellos datos que conforman el Genoma) se agrupan en Genes. Para procesar dichos genes, se tomaron en cuenta los "tipical likes" de cada usuario, se relacionó las categorías de facebook de esas páginas, luego esas categorías de FB se las mapeo a las categorías Shopear, y, al no existir una correspondencia 1 a 1 entre esa información, en el mapping de Facebook a Shopear se genera un factor para cada gen.
Para el cálculo del Genoma se utiliza un algoritmo de distancia Euclidiana entre los factores de afinidad de cada gen con las categorías de Shopear y los factores de afinidad con cada categoría de Shopear para los usuarios. El gen que tiene mayor similitud se convierte en el gen predominante para ese usuario y es el que se muestra en la pantalla de resultados.

El algoritmo utilizado se desarrolló de forma modular para que pueda ser modificado, reemplazado o complementado con otros algoritmos permitiendo distintos análisis de la información.

Para el siguiente prototipo se desarrolló una API Rest que permite extender la obtención de datos y Genomas en distintos entornos y aplicaciones, utilizando una estructura de API genérica que provee el conjunto de Genes para cada usuario agrupados en grupos de afinidad. Estos grupos, que podrán ser clasificados como "Amante de la música", "Tecnólogo" o "Activista", resultan de las distintas agrupaciones de tags que surgen de nuestro grafo. A continuación explicamos un ejemplo básico:

## GET data requests

/api/{appId}/{subjectId}/genome (200)

### Response (for response code 200):

```
{
 "Genome": {
   "completeProfile": true,
   "runId": "test_run",
   "attributes": {
Traveller: "0.4",
Geek: "0.3",
Artist: "0.3",
Student: "0.1",
Party Lover: "0.4",
Spiritual: "0.4",
Techie: "0.2",
Comics: "0.2",
TV & Entertainment: "0.0",
Sportist: "0.3",
Politics: "0.4",
Teen: "0.0",
Lifestyle: "0.5",
Music: "0.2",
Alternative: "0.5",
Rebel: "0.4",
     }   
 }
}
```

## GET statistical requests

/api/statistical/euclidean_distance/{subjectId1}/{subjectId2}

### Response (for response code 200):

```
{
  "similarity": 0.7440884327721421,
  "user1": {
    "id": "100000002056140",
    "name": "Patricia Rivoltella",
    "sg_categories": [
      {
        "id": "1",
        "name": "Moda Masculina",
        "likehood": 0.22128851540616246
      },
      {
        "id": "2",
        "name": "Moda Femenina",
        "likehood": 0.22128851540616246
      },
      {
        "id": "19",
        "name": "Otros",
        "likehood": 0.2801120448179272
      },
      {
        "id": "5",
        "name": "Hogar y decoración",
        "likehood": 0.028011204481792715
      },
      {
        "id": "16",
        "name": "Joyas y bijouterie",
        "likehood": 0.025210084033613446
      },
      {
        "id": "18",
        "name": "Salud y belleza",
        "likehood": 0.014005602240896357
      },
      {
        "id": "7",
        "name": "Arte y diseño",
        "likehood": 0.10644257703081232
      },
      {
        "id": "13",
        "name": "Manualidades y artesanías",
        "likehood": 0.028011204481792715
      },
      {
        "id": "3",
        "name": "Niños",
        "likehood": 0.022408963585434174
      },
      {
        "id": "11",
        "name": "Juegos",
        "likehood": 0.014005602240896357
      },
      {
        "id": "20",
        "name": "Entretenimiento",
        "likehood": 0.01680672268907563
      },
      {
        "id": "6",
        "name": "Tecnología",
        "likehood": 0.01680672268907563
      },
      {
        "id": "8",
        "name": "Libros",
        "likehood": 0.0028011204481792717
      },
      {
        "id": "17",
        "name": "Viajes y lugares",
        "likehood": 0.0028011204481792717
      }
    ]
  },
  "user2": {
    "id": "100000032415854",
    "name": "Aline Francisco",
    "sg_categories": [
      {
        "id": "17",
        "name": "Viajes y lugares",
        "likehood": 0.022522522522522525
      },
      {
        "id": "19",
        "name": "Otros",
        "likehood": 0.34234234234234234
      },
      {
        "id": "6",
        "name": "Tecnología",
        "likehood": 0.04504504504504505
      },
      {
        "id": "15",
        "name": "Gastronomía",
        "likehood": 0.013513513513513513
      },
      {
        "id": "18",
        "name": "Salud y belleza",
        "likehood": 0.14414414414414414
      },
      {
        "id": "1",
        "name": "Moda Masculina",
        "likehood": 0.0900900900900901
      },
      {
        "id": "2",
        "name": "Moda Femenina",
        "likehood": 0.0900900900900901
      },
      {
        "id": "3",
        "name": "Niños",
        "likehood": 0.05855855855855856
      },
      {
        "id": "11",
        "name": "Juegos",
        "likehood": 0.013513513513513513
      },
      {
        "id": "20",
        "name": "Entretenimiento",
        "likehood": 0.018018018018018018
      },
      {
        "id": "16",
        "name": "Joyas y bijouterie",
        "likehood": 0.08558558558558559
      },
      {
        "id": "4",
        "name": "Mascotas",
        "likehood": 0.018018018018018018
      },
      {
        "id": "7",
        "name": "Arte y diseño",
        "likehood": 0.031531531531531536
      },
    ]
  }
}
```

## Dependencias globales:

- Nodejs v0.10+
- ElasticSearch 1.2+
- npm install grunt-cli -g

Referencias sobre las operaciones de grunt tanto para el CLI como para la Web:

### CLI:

- **grunt es-init**: inicializa los índices, mappings y data en ElasticSearch.
- **grunt es-put-mappings**: inicializa los mappings de ElasticSearch. Soporta un argumento de filtro para los mappings especificado. Ej.: grunt es-put-mappings - filter="subjects"
- **grunt es-put-data**: inicializa los datos por defecto en ElasticSearch. Soporta un argumento de filtro para los datos especificado. Ej.: grunt es-put-data - filter="raw_subjects"

### Web:

- **grunt**: compila las vistas, scripts y styles.
- **grunt-watch**: monitorea cambio en los archivos .ect, .js y .less y cuando suceden ejecuta grunt. (útil solo en momento de desarrollo).

## Referencia CLI:

Se ejecuta el programa de línea de consola desde el directorio cli mediante el intérprete de nodejs. Ej: node app.js ARGS
Argumentos:

- node app.js process -o retrieve-subjects: recupera los datos de FB para los ids cargados en raw_subjects. Si un ID en particular ya fue procesado, se chequea la última fecha de obtención de los datos, si es mayor a 7 días se vuelven a obtener.
- node app.js process -o retrieve-genes: calcula la información de los genes precargados en base los likes típicos.
- node app.js process -o process-genes: procesa los genes con la información obtenida mediante la operación retrieve-genes. Nota: antes de ejecutar este comando se debe haber ejecutar retrieve-genes.
- node app.js process -o subjects: procesa los usuarios y calcula su gen en base a la información obtenida mediante el proceso retrieve-subjects. Nota: antes de ejecutar este comando se debe haber ejecutado retrieve-genes y retrieve-subjects.

## Referencia Mappings:

- raw_subjects: información en crudo de los usuarios. Inicialmente este tipo contiene solo los Ids de los usuarios, el resto de los datos son obtenidos mediante la operación retrieve-subjects.
- sessions: sesiones en la web.
- sg_categories: categorías de Shopear y sus relaciones a las categorías de FB.
- sg_genes: Definición de genes.
- subjects: información procesada de los usuarios. Este tipo se llena mediante la ejecución de process-subjects.
