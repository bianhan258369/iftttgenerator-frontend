import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpEventType, HttpResponse } from "@angular/common/http";
import { GenerateService } from '../generate.service';
import { UploadService } from '../upload.service';
import * as joint from 'node_modules/jointjs/dist/joint.js';
import { Rect } from '../entity/Rect';
import { Oval } from '../entity/Oval';
import { Line } from '../entity/Line';
import { Phenomenon } from '../entity/Phenomenon';
import { PFService } from '../pf.service';
import { result } from 'lodash';


@Component({
	selector: 'app-main-ui',
	templateUrl: './main-ui.component.html',
	styleUrls: ['./main-ui.component.css']
})
export class MainUIComponent implements OnInit {
	interval
	requirementTexts: string;
	refindeRequirements: string;
	errors: Array<string>;
	droolsRules: Array<string>;
	ontologyFilePath: string;
	graph: joint.dia.Graph;
	paper: joint.dia.Paper;
	rects: Array<Rect>;
	ovals: Array<Oval>;
	lines: Array<Line>;
	phenomena: Array<Phenomenon>
	referencePhenomena: Array<Phenomenon>

	constructor(private generateService: GenerateService, private uploadService: UploadService, private pfService: PFService) { }

	ngOnInit() {
		this.initPaper();
		this.change_Menu('requirements')
		this.errors = new Array<string>();
		this.droolsRules = new Array<string>();
		this.rects = new Array<Rect>();
		this.ovals = new Array<Oval>();
		this.lines = new Array<Line>();
		this.phenomena = new Array<Phenomenon>()
		this.referencePhenomena = new Array<Phenomenon>();
	}

	open2 = true;
	setOpen2(): void {
		this.open2 = !this.open2;
	}
	// open3 = true;
	// setOpen3(): void {
	// 	this.open3 = !this.open3;
	// }
	open4 = true;
	setOpen4(): void {
		this.open4 = !this.open4;
	}
	open5 = true;
	setOpen5(): void {
		this.open5 = !this.open5;
	}

	showProblemDiagram() {
		this.graph.clear();
		var MachineElement = joint.dia.Element.define('examples.CustomTextElement', {
			attrs: {
				label: {
					textAnchor: 'middle', //文本居中
					textVerticalAnchor: 'middle',
				},
				r: {
					strokeWidth: 1, //宽度
					stroke: '#000000', //颜色
					fill: 'none' //填充色
				},
				r1: {
					strokeWidth: 1,
					stroke: '#000000',
					fill: 'none',
				},
				r2: {
					strokeWidth: 1,
					stroke: '#000000',
					fill: 'none',
				},
			}
		}, {
			markup: [{
				tagName: 'text',
				selector: 'label'
			}, {
				tagName: 'rect',
				selector: 'r'
			}, {
				tagName: 'rect',
				selector: 'r1'
			}, {
				tagName: 'rect',
				selector: 'r2'
			}]
		});

		var machineElement = new MachineElement();
		let rectGraphList = new Array<joint.shapes.basic.Rect>();
		let ovalGraphList = new Array<joint.shapes.basic.Ellipse>();
		for (let i = 0; i < this.rects.length; i++) {
			let rect = new joint.shapes.standard.Rectangle({
				position: { x: this.rects[i].x1, y: this.rects[i].y1 },
				size: { width: this.rects[i].x2 + 150, height: this.rects[i].y2 },
				attrs: { body: { stroke: '#000000', fill: 'none', strokeWidth: 1 }, label: { text: this.rects[i].text.replace("&#x000A", '\n'), fill: '#000000' } }
			});
			rectGraphList[i] = rect;
			if (this.rects[i].state === 2) {
				machineElement.attr(
					{
						label: {
							text: this.rects[i].text.replace("&#x000A", '\n') + '(' + this.rects[i].shortName + ')',
							x: this.rects[i].x1,
							y: this.rects[i].y1,
						},
						r: {
							ref: 'label',
							refX: -45, //坐标原点
							refY: 0,
							x: 0, //图形位置
							y: 0,
							refWidth: 60, //图形大小
							refHeight: '150%',
						},
						r1: {
							ref: 'r',
							refX: 20,
							refY: 0,
							x: 0,
							y: 0,
							refWidth: -20,
							refHeight: '100%'
						},
						r2: {
							ref: 'r',
							refX: 40,
							refY: 0,
							x: 0,
							y: 0,
							refWidth: -40,
							refHeight: '100%',
						},
						root: {
							title: 'machine:' + this.rects[i].text,
						}
					});
			}
		}
		for (let i = 0; i < this.ovals.length; i++) {
			let oval = new joint.shapes.standard.Ellipse({
				position: { x: this.ovals[i].x1, y: this.ovals[i].y1 },
				size: { width: this.ovals[i].x2 + 150, height: this.ovals[i].y2 },
				attrs: { body: { fill: 'none', strokeWidth: 1, strokeDasharray: '10,5' }, label: { text: this.ovals[i].text, fill: '#000000' } }
			});
			ovalGraphList[i] = oval;
		}
		for (let i = 0; i < this.lines.length; i++) {
			let line = this.lines[i];
			if (line.state === 0) {
				let rectTo: Rect = line.to as Rect;
				let rectToIndex = -1;
				for (let j = 0; j < this.rects.length; j++) {
					let tempRect: Rect = this.rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rectTo.text.replace("&#x000A", '\n')) rectToIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: machineElement.id },
					target: { id: rectGraphList[rectToIndex].id },
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'none',
							'stroke': 'none',
						}
					},

				});
				this.graph.addCells([rectGraphList[rectToIndex], machineElement, link]);
			}
			else if (line.state === 1) {
				let oval: Oval = line.from as Oval;
				let rect: Rect = line.to as Rect;
				let rectIndex = -1;
				let ovalIndex = -1;
				for (let j = 0; j < this.rects.length; j++) {
					let tempRect: Rect = this.rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rect.text.replace("&#x000A", '\n')) rectIndex = j;
				}
				for (let j = 0; j < this.ovals.length; j++) {
					let tempOval: Oval = this.ovals[j];
					if (tempOval.text === oval.text) ovalIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: rectGraphList[rectIndex].id },
					target: { id: ovalGraphList[ovalIndex].id },
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'none',
							'stroke': 'none',
						},
						strokeDasharray: '8,4',
					},

				});
				this.graph.addCells([rectGraphList[rectIndex], ovalGraphList[ovalIndex], link]);
			}
			else {
				let oval: Oval = line.from as Oval;
				let rect: Rect = line.to as Rect;
				let rectIndex = -1;
				let ovalIndex = -1;
				for (let j = 0; j < this.rects.length; j++) {
					let tempRect: Rect = this.rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rect.text.replace("&#x000A", '\n')) rectIndex = j;
				}
				for (let j = 0; j < this.ovals.length; j++) {
					let tempOval: Oval = this.ovals[j];
					if (tempOval.text === oval.text) ovalIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: ovalGraphList[ovalIndex].id },
					target: { id: rectGraphList[rectIndex].id },
					attrs: {
						line: {
							strokeDasharray: '5 5'
						}
					}
				});
				link.appendLabel({
					attrs: {
						text: {
							text: line.name,
						},
						body: {
							stroke: 'transparent',
							fill: 'transparent'
						}
					}
				});
				link.attr({
					line: {
						strokeWidth: 1,
						targetMarker: {
							'fill': 'black',
							'stroke': 'black',
						},
						strokeDasharray: '8,4',
					},

				});
				this.graph.addCells([rectGraphList[rectIndex], ovalGraphList[ovalIndex], link]);
			}
		}
	}

	initPaper(): void {
		this.graph = new joint.dia.Graph();
		let d = $("#content");
		let wid = d.width();
		let hei = d.height();
		this.paper = new joint.dia.Paper({
			el: $("#content"),
			width: wid,
			height: hei,
			model: this.graph,
			gridSize: 10,
			drawGrid: true,
			background: {
				color: 'rgb(240,255,255)'
			}
		});
		var that = this;

		this.paper.on('blank:mousewheel', (event, x, y, delta) => {
			let scale = that.paper.scale();
			that.paper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
		});
	}

	selectedFileOnChanged(event) {
		this.uploadFile(event.target.files[0])
	}

	uploadFile(file: File) {
		this.uploadService.uploadFile(file).subscribe(event => {
			if (event.type == HttpEventType.UploadProgress) {
				const percentDone = Math.round(100 * event.loaded / event.total);
				console.log(`File is ${percentDone}% loaded.`);
			} else if (event instanceof HttpResponse) {
				console.log(event.body.filePath)
				this.ontologyFilePath = event.body.filePath;
			}
		},
			(err) => {
				console.log("Upload Error:", err);
			}, () => {
				console.log("Upload done");
			}
		)
	}

	change_Menu(tab: string) {
		if (tab === 'requirements') {
			document.getElementById(tab + 'Panel').style.display = 'block';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('droolsrulesPanel').style.display = 'none';
			document.getElementById(tab).style.background = '#166dac'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('droolsrules').style.background = '#62a0cc'
		}
		else if (tab === 'intermediate') {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById(tab + 'Panel').style.display = 'block';
			document.getElementById('content').style.display = 'block';
			document.getElementById('droolsrulesPanel').style.display = 'none';
			document.getElementById(tab).style.background = '#166dac'
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('droolsrules').style.background = '#62a0cc'
		}
		else {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById(tab + 'Panel').style.display = 'block';
			document.getElementById(tab).style.background = '#166dac'
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#62a0cc'
		}
	}

	generateRefinedRequirements() {
		this.generateService.refineRequirements(this.requirementTexts.split('\n').join('//'), this.ontologyFilePath).subscribe(result => {
			console.log(result)
			this.refindeRequirements = result.refinedRequirements;
			document.getElementById('input_textarea').style.height = '35%';
			document.getElementById('refined_textarea').style.height = '35%';
			document.getElementById('refined_textarea').style.display = 'block';
		})
	}

	check() {
		this.errors.length = 0
		this.errors.push('error1')
		this.errors.push('error2')
		this.errors.push('error3')
		this.errors.push('error4')
		this.errors.push('error5')
		this.errors.push('error6')
	}

	generateDroolsRules() {
		var allRequirements = this.requirementTexts + '\n' + this.refindeRequirements;
		this.pfService.getProblemDiagram(allRequirements.split('\n').join('//'), this.ontologyFilePath).subscribe(result1 => {
			this.phenomena = result1.phenomena;
			this.referencePhenomena = result1.referencePhenomena
			this.ovals = result1.ovals
			this.rects = result1.rects
			this.lines = result1.lines
			document.getElementById("intermediate").style.display = 'block';
			this.change_Menu("intermediate")
			this.showProblemDiagram()
			this.generateService.transformToDrools(allRequirements.split('\n').join('//'), this.ontologyFilePath).subscribe(result2 => {
				this.droolsRules = result2;
				document.getElementById("droolsrules").style.display = 'block';
				this.change_Menu('droolsrules')
			})
		})
	}

}
