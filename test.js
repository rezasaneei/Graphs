const driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "1234"));

var config = {
  container_id: "viz",
  server_url: "bolt://localhost:7687",
  server_user: "neo4j",
  server_password: "1234",
  labels: {
      "node": {
          caption: "Name",
          size: "Size",
          community: "Class"
      }
  },
  relationships: {
      "LinkedTo": {
          caption: false,
          thickness: "Weight"
      },
  },
  initial_cypher: "match(n) optional match (n)-[r:LinkedTo]->(m) return *",
  arrows: true
};

const viz = new NeoVis.default(config);
viz.render();
console.log(viz);


document.getElementById("stabilize").addEventListener("click", vizStabilize)
document.getElementById("reload").addEventListener("click", vizReload)

document.getElementById("btnAddAll").addEventListener("click", addAllNodes)
document.getElementById("btnShowAll").addEventListener("click", showAllNodes)
document.getElementById("btnDeleteAll").addEventListener("click", deleteAllNodes)

document.getElementById("btnAddOne").addEventListener("click", addNode)
document.getElementById("btnAddEdge").addEventListener("click", addEdge)
document.getElementById("btnDeleteOne").addEventListener("click", deleteNode)
document.getElementById("btnCalcShortestPath").addEventListener("click", calcShortestPath)



function draw() {
    viz.reload();
    console.log(viz);
}



function showAllNodes () {
  // const session = driver.session()
  // session
  // .run(
  //     "MATCH (n) return n"
  // )

  // .then(result => {
  //   session.close();
  //   if (result) {
  //     console.log(result);
  //     console.log('Nodes shown.');
  //   }
  // })
  // .catch((error) => {
  //   session.close();
  //   console.log("Error" + error);
  // })
  draw();
}



function addAllNodes () {

  fpath = "file:///C:/Users/rezas/OneDrive/Test/simple_graph.csv";
  var session = driver.session();
  session
  .run("LOAD CSV WITH HEADERS FROM $fpath AS row \
  MERGE (n:node {Name: row.Name, Class: toInteger(row.Class), Size: toInteger(row.Size)});", {fpath:fpath})
  .then((result) => {
    console.log(result);
    session.close()
    if (result) {
      console.log('Nodes Created');
      session = driver.session()
      session
      .run("LOAD CSV WITH HEADERS FROM $fpath AS row \
        MATCH (a:node),(b:node) \
        WHERE a.Name = row.Name AND b.Name = row.LinkedTo \
        MERGE (a)-[r1:LinkedTo {Weight: row.Weight}]->(b);",  {fpath:fpath})
      .then((result) => {
         console.log(result);
         session.close();
         if (result) {
           console.log('Edges Created');
         }
      })
      .catch((error) => {
        session.close();
        console.log("Error" + error);
      })
    }
  })
  .catch((error) => {
    session.close();
    console.log("Error" + error);
  })
  draw();
}



function deleteAllNodes () {
  const session = driver.session();
  session
  .run(
      "MATCH (n) DETACH DELETE n"
  )
  .then(result => {
    session.close()
  
    if (result) {
      console.log('Nodes deleted.')
    }
  })
  .catch((error) => {
    session.close();
    console.log("Error" + error);
  })
  draw();
}



function addNode () {

  var node_name = document.getElementById("txtNodeName").value;
  var node_class = document.getElementById("txtNodeClass").value;
  var node_size = document.getElementById("txtNodeSize").value;
  console.log(node_name);
  console.log(node_class);
  console.log(node_size);
  var session = driver.session();
  session
  .run("MERGE (n:node {Name: $node_name, Class: coalesce(toInteger($node_class),1), Size: coalesce(toInteger($node_size),10)});", {node_name:node_name, node_class:node_class, node_size:node_size})
  .then((result) => {
    console.log(result);
    session.close()
    if (result) {
      console.log('Node Created');
      }
    })
    .catch((error) => {
      session.close();
      console.log("Error" + error);
    })
  draw();
}



function addEdge () {
  const session = driver.session()
  var source_name = document.getElementById("txtSourceName").value;
  var target_name = document.getElementById("txtTargetName").value;
  var weight = document.getElementById("txtEdgeWeight").value;
  session
  .run(
      "MATCH (n),(m) WHERE n.Name = $source_name AND m.Name = $target_name MERGE (n)-[:LinkedTo {Weight: coalesce(toInteger($weight),10)}]->(m)", {source_name:source_name, target_name:target_name, weight:weight})
  .then(result => {
    session.close()
  
    if (result) {
      console.log('Edge Created.')
    }
  })
  .catch((error) => {
    session.close();
    console.log("Error" + error);
  })
  draw();
}



function deleteNode () {
  const session = driver.session()
  var node_name = document.getElementById("txtNodeName2").value;
  session
  .run(
      "MATCH (n) WHERE n.Name = $node_name DETACH DELETE n", {node_name:node_name}
  )
  .then(result => {
    session.close()
  
    if (result) {
      console.log('Node deleted.')
    }
  })
  .catch((error) => {
    session.close();
    console.log("Error" + error);
  })
  draw();
}



function calcShortestPath () {
  const session = driver.session()
  var source_name = document.getElementById("txtSourceName").value;
  var target_name = document.getElementById("txtTargetName").value;
  var weight = document.getElementById("txtEdgeWeight").value;
  session
  .run(
      "MATCH (n),(m) WHERE n.Name = $source_name AND m.Name = $target_name MERGE (n)-[:LinkedTo {Weight: coalesce(toInteger($weight),10)}]->(m)", {source_name:source_name, target_name:target_name, weight:weight})
  .then(result => {
    session.close()
  
    if (result) {
      console.log('Edge Created.')
    }
  })
  .catch((error) => {
    session.close();
    console.log("Error" + error);
  })
  draw();
}

function vizStabilize() {
  viz.stabilize();
}

function vizReload() {

  let cypher = document.getElementById("cypher").value;

  if (cypher.length > 3) {
      viz.renderWithCypher(cypher);
  } else {
      console.log("reload");
      viz.reload();
  }
}