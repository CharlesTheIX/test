# Hyve Storage

- [Introduction](#introduction)
- [Development](#development)
- [Minio](#minio)
  - [Remote Connection](#remote-connection)
- [API](#api)
  - [Statuses](#statuses)
- [Webapp](#webapp)

## Introduction

This project contains the API & Webapp repositories for the Hyve storage application.

The primary aim of the Hyve Storage application is create a Hyve [S3](https://aws.amazon.com/s3/) like storage system & interface for internal use & to be a service that we can provide to customers as an auxiliary to the myHyve portal.

The primary tools / technologies used for this project are:

- [Typescript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [NextJS](https://nextjs.org/)
- [MinIO](https://www.min.io/)
- [NodeJS]()
- [Postman]()
- [Docker]()
- [MongoDB]()

## Development

This project is currently under development & therefore no documentation can be found yet. However, below are is a collection of notes for developers to aid in initiating new developers to the project as well as help maintain consistent coding standards.

- Enable auto formatting with prettier (the rc file should be in the root of the project [here](./.prettierrc.yml))
- The webapp uses a mixture if Tailwind & SASS for styling UI components.
- Should there be areas where current features are not implement, or wherever seems appropriate, please use the comment flag `//TODO:` to make house keeping easier & more 'searchable'.

## Minio

The API service uses the MinIO dependency `minio`, the documentation for which can be found [here](https://github.com/minio/minio-js)

### Remote Connection

```bash
# SSH connection string for the azure instance:
ssh -i ./azure_minio_shh_key.pem hyveadmin@4.234.131.233

# Make sure that the user running Minio owns the /data directory:
sudo chown -R hyveadmin:hyveadmin /data

# Ensure the user has read, write & execute permissions:
sudo chmod u+rwx /data

# Restart the Minio service
minio server --address 0.0.0.0:9000 /data
```

## API

### Statuses

Below are the statuses that the API can return within the ApiResponse.

#### Success Responses:

- `200 -> SUCCESS` -- The api ran as expected with no errors and returns a data value
- `201 -> DB_UPDATED` -- The api ran as expected with no errors but returns no data
- `204 -> NO_CONTENT` -- The api ran as expected with no errors but the request resulted in no content being found ant therefore no data is returned. For example if you call the getAllUsers endpoint and there are no users / the return value from the database is an empty array.
- `222 -> PARTIAL_UPDATE` -- The api ran and the primary function was successful however not all parts of the request were fulfilled. For example on company creation, the company might be created but the update of the user with the relative company_id failed.

#### User Error Responses:

- `400 -> BAD` -- The request was made but was missing required data to complete the request.
- `401 -> UNAUTHORISED` -- The request did not have the correct permissions to access the desired endpoint.
- `403 -> FORBIDDEN` -- The request can not be made to the endpoint.
- `404 -> NOT_FOUND` -- The request was made and the required fields were present but no data entry exists that satisfies the request.
- `409 -> CONFLICT` -- The request was made and the required fields were present but there is a conflict. For example if creating a user with a username that already exists, this will lead to a conflict.

#### Server Error Responses:

- `500 -> SEVER_ERROR` -- The server failed to process the request.

## Webapp
