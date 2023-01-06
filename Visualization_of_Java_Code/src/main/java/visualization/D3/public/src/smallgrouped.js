const graph = {
  "nodes": [
    {
      "id": 0, 
      "visibility": true,
      "name": "a",
      "width": 200,
      "height": 100
    },
    {
      "id": 1, 
      "visibility": true,
      "name": "b",
      "width": 200,
      "height": 100
    },
    {
      "id": 2, 
      "visibility": true,
      "name": "c",
      "width": 200,
      "height": 100
    },
    {
      "id": 3, 
      "visibility": true,
      "name": "d",
      "width": 200,
      "height": 100
    },
    {
      "id": 4,  
      "visibility": true,
      "name": "e",
      "width": 200,
      "height": 100
    },
    {
      "id": 5,  
      "visibility": true,
      "name": "f",
      "width": 200,
      "height": 100
    },
    {
      "id": 6,  
      "visibility": true,
      "name": "g",
      "width": 200,
      "height": 100
    },
    {
      "id": 7, 
      "visibility": true,
      "name": "bc",
      "width": 200,
      "height": 100
    }
  ],
  "links": [
    {
      "id": 9,
      "name": "test",
      "source": 1,
      "target": 7,
      "visibility": true
    },
    {
      "id": 10,
      "name": "test",
      "source": 7,
      "target": 2,
      "visibility": true
    },
    {
      "id": 11,
      "name": "test",
      "source": 2,
      "target": 3,
      "visibility": true
    },
    {
      "id": 12,
      "name": "test",
      "source": 3,
      "target": 4,
      "visibility": true
    },
    {
      "id": 13,
      "name": "test",
      "source": 0,
      "target": 1,
      "visibility": true
    },
    {
      "id": 14,
      "name": "test",
      "source": 2,
      "target": 0,
      "visibility": true
    },
    {
      "id": 15,
      "name": "test",
      "source": 3,
      "target": 5,
      "visibility": true
    },
    {
      "id": 16,
      "name": "test",
      "source": 0,
      "target": 5,
      "visibility": true
    }
  ],
  "groups": [
    { "id": 0, "visibility": true, "name": "group0", "leaves": [0], "groups": [1] },
    { "id": 1, "visibility": true, "name": "group1", "leaves": [1], "groups": [] },
    { "id": 2, "visibility": true, "name": "group2", "leaves": [2], "groups": [] },
    { "id": 3, "visibility": true, "name": "group3", "leaves": [3], "groups": [] },
    { "id": 4, "visibility": true, "name": "group4", "leaves": [4], "groups": [2, 5, 6] },
    { "id": 5, "visibility": true, "name": "group5", "leaves": [5], "groups": [] },
    { "id": 6, "visibility": true, "name": "group6", "leaves": [6], "groups": [] },
    { "id": 7, "visibility": true, "name": "group7", "leaves": [7], "groups": [] },
  ]
}


export default graph