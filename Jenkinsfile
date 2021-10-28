properties([parameters([
      string(
        defaultValue: 'https://softwareag.com/Adabas/adabas-rest-webapp-mirror.git',
        name: 'gitRepository',
        trim: true
      ),
      string(
        defaultValue: 'https://softwareag.com:8081',
        name: 'Artifactory',
        trim: true
      ),
      gitParameter(branch: '', branchFilter: '.*',
        defaultValue: '*/main', description: '', name: 'gitbranch',
        quickFilterEnabled: false, selectedValue: 'NONE', sortMode: 'NONE',
        tagFilter: '*', type: 'PT_BRANCH_TAG')
    ])
])

node('docker-builds') {
    environment {
        CI = 'true' 
    }
    stage('Checkout') {
       checkout([$class: 'GitSCM', branches: [
         [name: gitbranch]
       ], doGenerateSubmoduleConfigurations: false, extensions: [
         [$class: 'CleanBeforeCheckout', deleteUntrackedNestedRepositories: true]
       ], submoduleCfg: [], userRemoteConfigs: [
         [credentialsId: 'github-sag-tkn', url: gitRepository]
       ]])
    }
    docker.image('node:14.15.4-alpine').inside {
    withEnv([
        'HOME=.',
    ]){
      stage('Install') {
        sh 'rm -f node_modules dist;npm install'
      }
      stage('Build') {
        sh 'npm run build'
      }
    }
    stage('Upload') {
      sh 'cd dist;tar cfvz adabas-rest-webApp.tar.gz *'
      sh 'curl -v -u $(ARTIFACTORY_PASS) -X POST "'+Artifactory+'/service/rest/v1/components?repository=maven-sag" -F maven2.groupId=com.softwareag.common -F maven2.artifactId=adabas-rest-go -F maven2.version=$(VERSION) -F maven2.asset1=@dist/adabas-rest-webApp.tar.gz -F maven2.asset1.extension=tar.gz'
    }
  }
}
