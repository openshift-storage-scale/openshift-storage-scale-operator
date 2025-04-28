# OpenShift FusionAccess Operator console plugin

## Development

### Set up a development OpenShift cluster

1. Follow the docs at the [aws-ibm-gpfs-playground](https://github.com/openshift-storage-scale/aws-ibm-gpfs-playground) repo.

   - Basically, that is:  
     `make TAGS=1_ocp_install,2_aws,3_ebs,4_gpfs,4_operator install`
   - Once complete, the cluster credentials will be stored under:  
     `~/aws-gpfs-playground/ocp_install_files/auth`

2. From a terminal execute:

   ```sh
   oc login --web --server=...
   npm install
   npm run start
   ```

3. Your default browser should open automatically, otherwise navigate to http://localhost:9000.
