const graph = {
  "nodes": [
    {
      "name": "a",
      "width": 60,
      "height": 40
    },
    {
      "name": "b",
      "width": 60,
      "height": 40
    },
    {
      "name": "c",
      "width": 60,
      "height": 40
    },
    {
      "name": "d",
      "width": 60,
      "height": 40
    },
    {
      "name": "e",
      "width": 60,
      "height": 40
    },
    {
      "name": "f",
      "width": 60,
      "height": 40
    },
    {
      "name": "g",
      "width": 60,
      "height": 40
    },
    {
      "name": "b-to-c",
      "width": 60,
      "height": 10
    }
  ],
  "links": [
    {
      "name": "test",
      "source": 1,
      "target": 7
    },
    {
      "name": "test",
      "source": 7,
      "target": 2
    },
    {
      "name": "test",
      "source": 2,
      "target": 3
    },
    {
      "name": "test",
      "source": 3,
      "target": 4
    },
    {
      "name": "test",
      "source": 0,
      "target": 1
    },
    {
      "name": "test",
      "source": 2,
      "target": 0
    },
    {
      "name": "test",
      "source": 3,
      "target": 5
    },
    {
      "name": "test",
      "source": 0,
      "target": 5
    }
  ],
  "groups": [
    { "name": "myfirstgroup", "leaves": [0], "groups": [1] },
    { "name": "mysecondgroup", "leaves": [1, 7, 2] },
    { "name": "mythirdgroup", "leaves": [3, 4] }
  ]
}

export default graph