let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')

import { NormalSupplyDemand } from './charts/normalSupplyDemand'






new NormalSupplyDemand(canvas, ctx).init()
