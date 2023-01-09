const graph = {
  "nodes": [
    {
      "id": 0, 
      "visibility": true,
      "name": "a",
      "width": 100,
      "height": 50
    },
    {
      "id": 1, 
      "visibility": true,
      "name": "b",
      "width": 100,
      "height": 50
    },
    {
      "id": 2, 
      "visibility": true,
      "name": "c",
      "width": 100,
      "height": 50
    },
    {
      "id": 3, 
      "visibility": true,
      "name": "d",
      "width": 100,
      "height": 50
    },
    {
      "id": 4,  
      "visibility": true,
      "name": "e",
      "width": 100,
      "height": 50
    },
    {
      "id": 5,  
      "visibility": true,
      "name": "f",
      "width": 100,
      "height": 50
    },
    {
      "id": 6,  
      "visibility": true,
      "name": "g",
      "width": 100,
      "height": 50
    },
    {
      "id": 7, 
      "visibility": true,
      "name": "h",
      "width": 100,
      "height": 50
    }
  ],
  "links": [
    {
      "id": 0,
      "name": "bToh",
      "source": 1,
      "target": 7,
      "visibility": true
    },
    {
      "id": 1,
      "name": "hToc",
      "source": 7,
      "target": 2,
      "visibility": true
    },
    {
      "id": 2,
      "name": "cTod",
      "source": 2,
      "target": 3,
      "visibility": true
    },
    {
      "id": 3,
      "name": "dToe",
      "source": 3,
      "target": 4,
      "visibility": true
    },
    {
      "id": 4,
      "name": "aTob",
      "source": 0,
      "target": 1,
      "visibility": true
    },
    {
      "id": 5,
      "name": "cToa",
      "source": 2,
      "target": 0,
      "visibility": true
    },
    {
      "id": 6,
      "name": "dTof",
      "source": 3,
      "target": 5,
      "visibility": true
    },
    {
      "id": 7,
      "name": "aTof",
      "source": 0,
      "target": 5,
      "visibility": true
    }
  ],
  "groups": [
    { "id": 0, "visibility": true, "name": "groupA", "leaves": [0], "groups": [1], parentUniqueName: "null" },
    { "id": 1, "visibility": true, "name": "groupB", "leaves": [1], "groups": [], parentUniqueName: "groupA" },
    { "id": 2, "visibility": true, "name": "groupC", "leaves": [2], "groups": [], parentUniqueName: "groupE" },
    { "id": 3, "visibility": true, "name": "groupD", "leaves": [3], "groups": [], parentUniqueName: "null" },
    { "id": 4, "visibility": true, "name": "groupE", "leaves": [4], "groups": [2, 5, 6], parentUniqueName: "null" },
    { "id": 5, "visibility": true, "name": "groupF", "leaves": [5], "groups": [], parentUniqueName: "groupE" },
    { "id": 6, "visibility": true, "name": "groupG", "leaves": [6], "groups": [], parentUniqueName: "groupE" },
    { "id": 7, "visibility": true, "name": "groupH", "leaves": [7], "groups": [], parentUniqueName: "null" },
  ]
}


export default graph