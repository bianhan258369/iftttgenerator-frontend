import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpEventType, HttpResponse } from "@angular/common/http";
import { GenerateService } from '../service/generate.service';
import { UploadService } from '../service/upload.service';
import * as joint from 'node_modules/jointjs/dist/joint.js';
import { Rect } from '../entity/Rect';
import { Oval } from '../entity/Oval';
import { Line } from '../entity/Line';
import { Phenomenon } from '../entity/Phenomenon';
import { PFService } from '../service/pf.service';
import { indexOf, result } from 'lodash';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { calcPossibleSecurityContexts } from '@angular/compiler/src/template_parser/binding_parser';
import { SimulationService } from '../service/simulation.service';


@Component({
	selector: 'app-main-ui',
	templateUrl: './main-ui.component.html',
	styleUrls: ['./main-ui.component.css']
})
export class MainUIComponent implements OnInit {
	interval
	index: number;
	imgURL: string;
	requirementTexts: string;
	complementedRequirements: string;
	errors: Array<string>;
	ruleErrorFlag: boolean;
	formalismErrorFlag: boolean;
	problemDiagramFlag: boolean;
	rules: Array<string>;
	ontologyFilePath: string;
	graph: joint.dia.Graph;
	paper: joint.dia.Paper;
	rects: Array<Rect>;
	ovals: Array<Oval>;
	lines: Array<Line>;
	rectsWithSensors: Array<Rect>;
	linesWithSensors: Array<Line>;
	phenomena: Array<Phenomenon>
	referencePhenomena: Array<Phenomenon>;
	scenariaDiagramPaths: Array<string>;
	languageId = "req";
	editorOptions = { theme: "reqTheme", language: "req", minimap: { enabled: false } };
	editor;

	constructor(private generateService: GenerateService, private uploadService: UploadService, private pfService: PFService, private simulationService: SimulationService) { }

	ngOnInit() {
		this.initPaper();
		this.change_Menu('requirements')
		this.rules = new Array<string>();
		this.errors = new Array<string>();
		this.rects = new Array<Rect>();
		this.ovals = new Array<Oval>();
		this.lines = new Array<Line>();
		this.rectsWithSensors = new Array<Rect>();
		this.linesWithSensors = new Array<Line>();
		this.phenomena = new Array<Phenomenon>()
		this.referencePhenomena = new Array<Phenomenon>();
		this.scenariaDiagramPaths = new Array<string>();
		this.problemDiagramFlag = false;
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

	showProblemDiagram(rects, ovals, lines) {
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
		for (let i = 0; i < rects.length; i++) {
			let rect = new joint.shapes.standard.Rectangle({
				position: { x: rects[i].x1, y: rects[i].y1 },
				size: { width: rects[i].x2 + 150, height: rects[i].y2 },
				attrs: { body: { stroke: '#000000', fill: 'none', strokeWidth: 1 }, label: { text: rects[i].text.replace("&#x000A", '\n'), fill: '#000000' } }
			});
			rectGraphList[i] = rect;
			if (rects[i].state === 2) {
				machineElement.attr(
					{
						label: {
							text: rects[i].text.replace("&#x000A", '\n') + '(' + rects[i].shortName + ')',
							x: rects[i].x1,
							y: rects[i].y1,
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
							title: 'machine:' + rects[i].text,
						}
					});
			}
		}
		for (let i = 0; i < ovals.length; i++) {
			let oval = new joint.shapes.standard.Ellipse({
				position: { x: ovals[i].x1, y: ovals[i].y1 },
				size: { width: ovals[i].x2 + 150, height: ovals[i].y2 },
				attrs: { body: { fill: 'none', strokeWidth: 1, strokeDasharray: '10,5' }, label: { text: ovals[i].text, fill: '#000000' } }
			});
			ovalGraphList[i] = oval;
		}
		for (let i = 0; i < lines.length; i++) {
			let line = lines[i];
			if (line.state === 0) {
				let rectTo: Rect = line.to as Rect;
				let rectToIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
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
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rect.text.replace("&#x000A", '\n')) rectIndex = j;
				}
				for (let j = 0; j < ovals.length; j++) {
					let tempOval: Oval = ovals[j];
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
			else if (line.state === 2) {
				let oval: Oval = line.from as Oval;
				let rect: Rect = line.to as Rect;
				let rectIndex = -1;
				let ovalIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rect.text.replace("&#x000A", '\n')) rectIndex = j;
				}
				for (let j = 0; j < ovals.length; j++) {
					let tempOval: Oval = ovals[j];
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
			else {
				let rectFrom: Rect = line.from as Rect;
				let rectTo: Rect = line.to as Rect;
				let rectFromIndex = -1;
				let rectToIndex = -1;
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rectFrom.text.replace("&#x000A", '\n')) rectFromIndex = j;
				}
				for (let j = 0; j < rects.length; j++) {
					let tempRect: Rect = rects[j];
					if (tempRect.text.replace("&#x000A", '\n') === rectTo.text.replace("&#x000A", '\n')) rectToIndex = j;
				}
				let link = new joint.shapes.standard.Link({
					source: { id: rectGraphList[rectFromIndex].id },
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
				this.graph.addCells([rectGraphList[rectFromIndex], rectGraphList[rectToIndex], link]);
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
		this.paper.scale(0.8, 0.5);
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
			document.getElementById('requirementsPanel').style.display = 'block';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('rulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#166dac'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('rules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else if (tab === 'intermediate') {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'block';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('content').style.display = 'block';
			document.getElementById('rulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#166dac'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('rules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else if (tab === 'rules') {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('rulesPanel').style.display = 'block';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('rules').style.background = '#166dac'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('rulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'block';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('rules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#166dac'
			var vid = document.getElementById('video')
			// vid.src = "assets/video/demo.mp4"
		}
	}

	showSCD(index: number) {
		var path: string = this.scenariaDiagramPaths[index].trim();
		var time = (new Date()).getTime();
		var url = `http://localhost:8081/api/display?fileName=${path}&time=${time}`;
		this.imgURL = url;
		document.getElementById('requirementsPanel').style.display = 'none';
		document.getElementById('intermediatePanel').style.display = 'none';
		document.getElementById('scenarioPanel').style.display = 'block';
		document.getElementById('sccontent').style.display = 'block';
		document.getElementById('rulesPanel').style.display = 'none';
		document.getElementById('simulationPanel').style.display = 'none';
		document.getElementById('requirements').style.background = '#62a0cc'
		document.getElementById('intermediate').style.background = '#62a0cc'
		document.getElementById('scenario').style.background = '#166dac'
		document.getElementById('rules').style.background = '#62a0cc'
		document.getElementById('simulation').style.background = '#62a0cc'
		var scenarioTab: any = document.getElementById("scenario");
		scenarioTab.open = false;
	}

	displayPlaning() {
		document.getElementById("planing").style.display = 'block';
	}

	problemDiagramDerivation() {
		var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
		var allRequirements: string = ''
		for (var i = 0; i < requirements.split('\n').length; i++) {
			var requirement: string = requirements.split('\n')[i];
			if (requirement.trim() !== '') {
				allRequirements = allRequirements + requirement;
				if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
			}
		}
		this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
			this.phenomena = result.phenomena;
			this.referencePhenomena = result.referencePhenomena
			this.ovals = result.ovals
			this.rects = result.rectsWithoutSensors
			this.lines = result.linesWithoutSensors
			document.getElementById("intermediate").style.display = 'block';
			this.change_Menu("intermediate")
			this.showProblemDiagram(this.rects, this.ovals, this.lines)
			this.problemDiagramFlag = true;
			this.closeDetails();
		})
	}

	problemDiagramDerivation2() {
		var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
		var allRequirements: string = ''
		for (var i = 0; i < requirements.split('\n').length; i++) {
			var requirement: string = requirements.split('\n')[i];
			if (requirement.trim() !== '') {
				allRequirements = allRequirements + requirement;
				if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
			}
		}
		this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
			this.phenomena = result.phenomena;
			this.referencePhenomena = result.referencePhenomena
			this.ovals = result.ovals
			this.rects = result.rectsWithSensors
			this.lines = result.linesWithSensors
			this.rectsWithSensors = result.rectsWithSensors
			this.linesWithSensors = result.linesWithSensors
			document.getElementById("intermediate").style.display = 'block';
			this.change_Menu("intermediate")
			this.showProblemDiagram(this.rectsWithSensors, this.ovals, this.linesWithSensors)
			this.problemDiagramFlag = true;
			this.closeDetails();
		})
	}

	scenarioDiagramDerivation() {
		if (this.problemDiagramFlag === false) alert('Please Generate Problem Diagram First!')
		else {
			var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.pfService.getScenarioDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
				console.log(result)
				this.scenariaDiagramPaths = result.paths;
				document.getElementById("scenario").style.display = 'block';
				this.closeDetails();
			})
		}
	}

	ruleBasedCheck() {
		this.errors.length = 0
		this.errors.push('No Rule Errors!')
		this.ruleErrorFlag = true;
		// var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
		// var allRequirements: string = ''
		// for (var i = 0; i < requirements.split('\n').length; i++) {
		// 	var requirement: string = requirements.split('\n')[i];
		// 	if (requirement.trim() !== '') {
		// 		allRequirements = allRequirements + requirement;
		// 		if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
		// 	}
		// }
		// this.generateService.check(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
		// 	this.errors = result;
		// 	if (this.errors[0] === 'No Rule Errors!') this.ruleErrorFlag = true;
		// 	else this.ruleErrorFlag = false;
		// 	this.formalismErrorFlag = false;
		// })
		this.closeDetails();
	}


	formalismBasedCheck() {
		if (!this.ruleErrorFlag) {
			alert('Please Solve The Rule Errors First!')
			this.closeDetails();
		}
		else {
			this.errors.length = 0;
			var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.generateService.z3Check(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
				if (result === 'sat') {
					this.errors.length = 0
					this.errors.push('No Formalism Errors!');
					this.formalismErrorFlag = true;
				}
				else {
					this.errors.length = 0
					this.errors.push('unsat');
					this.formalismErrorFlag = false;
				}
			})
		}
	}

	checkSatisfaction() {
		if (!this.formalismErrorFlag) alert('Please Solve The Formalism Errors First!')
		if (this.problemDiagramFlag === false) alert('Please Generate Problem Diagram First!')
		else {
			var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.pfService.getScenarioDiagram(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
				console.log(result)
				this.scenariaDiagramPaths = result.paths;
				document.getElementById("scenario").style.display = 'block';
				this.closeDetails();
			})
		}
	}

	generateSystemBehaviours() {
		if (this.scenariaDiagramPaths.length === 0) alert('Not Passing Satisfaction Check!')
		else {
			var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.generateService.transform(allRequirements, this.ontologyFilePath, 'SystemBehaviour', this.index).subscribe(result => {
				this.rules = result;
				document.getElementById("rules").style.display = 'block';
				this.change_Menu('rules')
				this.closeDetails();
			})
		}
	}

	generateDroolsrules() {
		if (this.scenariaDiagramPaths.length === 0) alert('Not Passing Satisfaction Check!')
		else {
			var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.generateService.transform(allRequirements, this.ontologyFilePath, 'Drools', this.index).subscribe(result => {
				this.rules = result;
				document.getElementById("rules").style.display = 'block';
				this.change_Menu('rules')
				this.closeDetails();
			})
		}
	}

	generateOnenetRules() {
		if (this.scenariaDiagramPaths.length === 0) alert('Not Passing Satisfaction Check!')
		else {
			var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.generateService.transform(allRequirements, this.ontologyFilePath, 'Onenet', this.index).subscribe(result => {
				this.rules = result;
				document.getElementById("rules").style.display = 'block';
				this.change_Menu('rules')
				this.closeDetails();
			})
		}
	}

	closeDetails() {
		var details = document.getElementsByClassName("detail");
		for (var i = 0; i < details.length; i++) {
			var element: any = details[i];
			element.open = false;
		}
	}

	generateSimulation() {
		var requirements = this.requirementTexts + '\n' + this.complementedRequirements;
		var allRequirements: string = ''
		for (var i = 0; i < requirements.split('\n').length; i++) {
			var requirement: string = requirements.split('\n')[i];
			if (requirement.trim() !== '') {
				allRequirements = allRequirements + requirement;
				if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
			}
		}
		alert('onenet simulation is starting')
		this.simulationService.simulation(allRequirements, this.ontologyFilePath, this.index).subscribe(result => {
		})
	}

	monacoOnInit(editor) {
		this.editor = editor;
	}

	complementRequirements() {
		var planing = $("input[type=radio]:checked").val();
		if (planing === 'Random') this.index = 0;
		if (planing === 'SaveEnergy') this.index = 1;
		var requirements: string = ''
		for (var i = 0; i < this.requirementTexts.split('\n').length; i++) {
			var requirement: string = this.requirementTexts.split('\n')[i];
			if (requirement.trim() !== '') {
				requirements = requirements + requirement;
				if (i !== this.requirementTexts.split('\n').length - 1) requirements = requirements + '//'
			}
		}
		this.generateService.complementRequirements(requirements, this.ontologyFilePath, this.index).subscribe(result => {
			console.log(result)
			this.complementedRequirements = result.complementedRequirements;
			document.getElementById("planing").style.display = 'none';
		})
	}

	cancel() {
		document.getElementById("planing").style.display = 'none';
	}
}
