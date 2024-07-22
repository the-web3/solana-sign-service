## Description

Solana sign transaction services

## Deployment Steps
1. `cd solana-sign-service`

2. Copy `.env.example` to `.env`, modify the rpc_url and contract address

3. Install the dependencies
```bash
$ npm install
```

4. Running the app use the following command

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API 

1.batch address generate
- request
```
curl --location '127.0.0.1:3000/generateAddress' \
--header 'Content-Type: application/json' \
--data '{
    "address_num": 100
}'
```
- response
```
{
    "code": 200,
    "msg": "batch address genereate success",
    "addressList": [
        {
            "private_key": "9c153cdb3f982664aef4b2c30f9f8fa2aa5c3ca3a615aa6e042eadf89367b6b7d27bff6b8b36d049d3b87c85e91a390785c592b0f2833aafce6edbd516ffe7a0",
            "publicKey": "d27bff6b8b36d049d3b87c85e91a390785c592b0f2833aafce6edbd516ffe7a0",
            "address": "FAeHHTgUKTiVaLHzLt6JVvPyvrjqGH1X1h3Pb4mJdP83"
        },
        {
            "private_key": "c4f1b78674040e36582975a9f7f4a918603144b6331765338fbd48666b286b0bcae40a5f3f6a938336d25fd01145d17daf00ec71fd3ace3ec71cfbe810a75341",
            "publicKey": "cae40a5f3f6a938336d25fd01145d17daf00ec71fd3ace3ec71cfbe810a75341",
            "address": "Ef133CTi9PKKxMDhfDVns5TLXToTazuVpJTWh1NX7Rui"
        },
        {
            "private_key": "f991af4f1e17b5b906661d94587cc26d08d2cc515be5cb1636a8e3dac4c4614b977538c7c8cba8b07fc3e7f7c0fde51ff301a0d590390c7f31969fbbdb39cd39",
            "publicKey": "977538c7c8cba8b07fc3e7f7c0fde51ff301a0d590390c7f31969fbbdb39cd39",
            "address": "BCEEZtaPUxhUV3DKdaCwnANMrf9JRxjS4FNkV9b9TKuS"
        },
        {
            "private_key": "31d34d2fd01044e3536e0fa32c79f2e208bb6ddf3254ce69c185f175d8ac00be2e7f40f1feadc2b52fc1b978da36702f83444c0043b3ac68c7f646488813752b",
            "publicKey": "2e7f40f1feadc2b52fc1b978da36702f83444c0043b3ac68c7f646488813752b",
            "address": "48WJHAPUdU9zgtHgEaBpF4U2iH5NbTd787qoFq57pLwC"
        }
    ]
}
```

2.generate nonce account

- request
```
curl --location '127.0.0.1:3000/prepareAccount' \
--header 'Content-Type: application/json' \
--data '{
    "authorAddress": "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
    "from": "FvjWo4jbdsAP4ZHtJfiUpv5xb6TpBWRtDASGPmKKR39E",
    "recentBlockhash": "CSL1MJGUcDbgUEHh6fPsxum42vkhnQCh62whKjEiGwR3",
    "minBalanceForRentExemption": 1647680,
    "privs": [
        {
            "address": "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
            "key": "privateKey"
        },{
            "address": "FvjWo4jbdsAP4ZHtJfiUpv5xb6TpBWRtDASGPmKKR39E",
            "key": "privateKey"
        }
    ]
}'
```

- response
```
{
    "code": 200,
    "msg": "prepare account success",
    "raw_tx": "AhxYkJATh5ImUOqH/seh/O1r5w2scb/ge7FEDhOlvrZ6osJqqibFk4/NOKPdlIUiqYy8ax+e1c6w5smkJoUyPA7AOoOrF06YMeqQFrmwviQYd0TkWuVuskFGmWolFE98qAmgtcpaE2caUnHLMlm1HPHD2G7lg5rt6nrNmiaWRGYBAgADBTp7OHS6RnvmuB6jYePXRTr4uByIrt0ktQMf3aC8ca0y3cd4YWaZF28Fq43JDcZArkH77lSReLhpl01KfeqlJ0UGp9UXGSxWjuCKhF9z0peIzwNcMUWyGrNE2AYuqUAAAAan1RcZLFxRIYzJTD1K8X9Y2u4Im6H9ROPb2YoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACp7ZENM3d4oXE2QPH3TqlY7kMJl4hnX2iz4Wl82pAXkgIEAgABNAAAAABAJBkAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAwECAyQGAAAAOns4dLpGe+a4HqNh49dFOvi4HIiu3SS1Ax/doLxxrTI="
}
```

3.offline sign transaction

- request
```
curl --location '127.0.0.1:3000/signTransaction' \
--header 'Content-Type: application/json' \
--data '{
     "from": "4wHd9tf4x4FkQ3JtgsMKyiEofEHSaZH5rYzfFKLvtESD",
     "nonceAccount": "FvjWo4jbdsAP4ZHtJfiUpv5xb6TpBWRtDASGPmKKR39E",
     "amount": "0.01",
     "to": "782jzEK7e9VuGRu1j8Vm5cDU8t2GeyZbT6JgGJxhLTPB",
     "nonce": "GGLM3xu9yXzDoH3uhMEPcqqju6BB6C1FzoWKdiji5x5t",
     "decimal": 9,
     "privateKey":"privateKey",
      "mintAddress": ""
}'
```

- response
```
{
    "code": 200,
    "msg": "sign transaction success",
    "raw_tx": "AahwkVj8BXkIjbqfvUfdEZOLGRPwuWXT/kt2kvYD0rh4g3o73oyLx96nkFasHkeP4H/2QibmHpRzYOBqCKWyigUBAAIFOns4dLpGe+a4HqNh49dFOvi4HIiu3SS1Ax/doLxxrTLdx3hhZpkXbwWrjckNxkCuQfvuVJF4uGmXTUp96qUnRVrzJ+wcovNH/Npg+/zFLlUYp8Cng+Q7ylA3gmff3ohGBqfVFxksVo7gioRfc9KXiM8DXDFFshqzRNgGLqlAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOLM4+pMslckVh3gcHpZy6zklfMLKBRV7k7xuUHNm/6HAgQDAQMABAQAAAAEAgACDAIAAACAlpgAAAAAAA=="
}
```

## License

[MIT licensed](LICENSE).

## About Code


