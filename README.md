# paco-backend-graph-api

Build and run the Dockercontainer with `npm run docker:dev` or `npm run docker:prod` found in `package.json`

- API-Calls:

  - Get graphs:
    - Get all availibe ids from all graphs in database
    - `GET http://localhost:8080/ids`

  - Add graph:
    - Add a graph to MongoDB 
    - `POST http://localhost:8080/graph`
    - Body: 
     ```json
      {
      "_id": "4",
      "dfg": {"graph": "a graph"},
      "epc": {"graph": "a graph"},
      "bpmn": {"graph": "a graph"}
      }
      ```

  - Read graph:
    - Request for an graph with the given ID in MongoDB
    - `POST http://localhost:8080/graph/variants?id=2`   
    - Filter with the parameter in body:
      - variants
        ```json
        {
        "variants": ["3"]
        }
        ```
      - sequence
        ```json
        {
        "sequence": "001_0",
        }
        ```
 - For more information run `npm run doc`
