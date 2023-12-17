export type EvitaQLConfig = {
    mode?: EvitaQLMode
}

export interface EvitaQLMode {}

export class EvitaQLQueryMode implements EvitaQLMode {
    constructor() {}
}

export class EvitaQLConstraintListMode implements EvitaQLMode {
    readonly listType: ConstraintListType

    constructor(listType: ConstraintListType) {
        this.listType = listType
    }
}

export enum ConstraintListType {
    Filter = 'FILTER',
    Order = 'ORDER',
    Require = 'REQUIRE'
}