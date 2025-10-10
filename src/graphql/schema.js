import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'
import * as path from 'path'

export default mergeTypeDefs(loadFilesSync(path.join(__dirname, './typeDefs/*.graphql')))
