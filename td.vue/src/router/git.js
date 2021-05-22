import { providerTypes } from '../service/provider/providerTypes.js';

const providerType = providerTypes.git;

// While state is maintained via Vuex, this will allow for deep-linking of threat models
export const gitRoutes = [
    {
        path: `/${providerType}/:provider/repository`,
        name: `${providerType}Repository`,
        component: () => import(/* webpackChunkName: "repository" */ '../views/git/Repository.vue')
    },
    {
        path: `/${providerType}/:provider/:repository/branch`,
        name: `${providerType}Branch`,
        component: () => import(/* webpackChunkName: "branch" */ '../views/git/Branch.vue')
    },
    {
        path: `/${providerType}/:provider/:repository/:branch/threatmodels`,
        name: `${providerType}ThreatModelSelect`,
        component: () => import(/* webpackChunkName: "threatmodel-select" */ '../views/ThreatModelSelect.vue')
    },
    {
        path: `/${providerType}/:provider/:repository/:branch/:threatmodel`,
        name: `${providerType}ThreatModel`,
        component: () => import(/* webpackChunkName: "threatmodel" */ '../views/ThreatModel.vue')
    },
    {
        path: `/${providerType}/:provider/:repository/:branch/:threatmodel/edit`,
        name: `${providerType}ThreatModelEdit`,
        component: () => import(/* webpackChunkName: "threatmodel-edit" */ '../views/ThreatModelEdit.vue')
    }
];