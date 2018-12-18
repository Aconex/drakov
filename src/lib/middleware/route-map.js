//@flow
const glob = require('glob');
const async = require('async');
const parseBlueprint = require('../parse/blueprint');
const endpointSorter = require('./endpoint-sorter');
import type {Contract} from '../parse/contracts';

type Options = {
    sourceFiles: ?Array<string>,
    autoOptions: boolean,
    contracts: ?Array<Contract>
}
type EndpointCb = (err: Error, endpoints?: Array<any>) => void;

module.exports = function(options: Options, cb: EndpointCb) {
    const sourceFiles = options.sourceFiles;
    const autoOptions = options.autoOptions;
    const contracts = options.contracts;
    const routeMap = {};

    if (contracts) {
        contracts.forEach(contract => {
            const files = glob.sync(`${contract.fixtureFolder}/*.?(apib|md)`);
            setupRouteMap(files, contract);
        });
    } else if (sourceFiles) {
        const files = glob.sync(sourceFiles);
        setupRouteMap(files);
    } else {
        throw Error('Should not be here!! args should require either sourceFiles or contracts');
    }

    function setupRouteMap(files: Array<string>, contract?: Contract) {

        const asyncFunctions = [];

        files.forEach(function(filePath) {
            asyncFunctions.push(parseBlueprint(filePath, autoOptions, routeMap, contract));
        });

        async.series(asyncFunctions, function(err) {
            cb(err, endpointSorter.sort(routeMap));
        });
    }
};
