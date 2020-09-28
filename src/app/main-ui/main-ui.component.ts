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
import { result } from 'lodash';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


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
	ruleErrorFlag: boolean;
	scenarioErrorFlag: boolean;
	formalismErrorFlag: boolean;
	satisfactionErrorFlag: boolean;
	droolsRules: Array<string>;
	ontologyFilePath: string;
	pdgraph: joint.dia.Graph;
	pdpaper: joint.dia.Paper;
	scgraph: joint.dia.Graph;
	scpaper: joint.dia.Paper;
	rects: Array<Rect>;
	ovals: Array<Oval>;
	lines: Array<Line>;
	rectsWithSensors: Array<Rect>;
	linesWithSensors: Array<Line>;
	phenomena: Array<Phenomenon>
	referencePhenomena: Array<Phenomenon>
	languageId = "req";
	editorOptions = { theme: "reqTheme", language: "req", minimap: { enabled: false } };
	editor;

	constructor(private generateService: GenerateService, private uploadService: UploadService, private pfService: PFService) { }

	ngOnInit() {
		this.initPaper();
		this.change_Menu('requirements')
		this.droolsRules = new Array<string>();
		this.errors = new Array<string>();
		this.rects = new Array<Rect>();
		this.ovals = new Array<Oval>();
		this.lines = new Array<Line>();
		this.rectsWithSensors = new Array<Rect>();
		this.linesWithSensors = new Array<Line>();
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

	showProblemDiagram(rects, ovals, lines) {
		this.pdgraph.clear();
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
				this.pdgraph.addCells([rectGraphList[rectToIndex], machineElement, link]);
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
				this.pdgraph.addCells([rectGraphList[rectIndex], ovalGraphList[ovalIndex], link]);
			}
			else if(line.state === 2) {
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
				this.pdgraph.addCells([rectGraphList[rectIndex], ovalGraphList[ovalIndex], link]);
			}
			else{
				let rectFrom : Rect = line.from as Rect;
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
				this.pdgraph.addCells([rectGraphList[rectFromIndex], rectGraphList[rectToIndex], link]);
			}
		}
	}

	showScenarioDiagram(index){
		this.scgraph.clear();
	}

	initPaper(): void{
		this.initPdPaper();
		this.initScPaper();
	}

	initPdPaper(): void {
		this.pdgraph = new joint.dia.Graph();
		let d = $("#pdcontent");
		let wid = d.width();
		let hei = d.height();
		this.pdpaper = new joint.dia.Paper({
			el: $("#pdcontent"),
			width: wid,
			height: hei,
			model: this.pdgraph,
			gridSize: 10,
			drawGrid: true,
			background: {
				color: 'rgb(240,255,255)'
			}
		});
		this.pdpaper.scale(0.8, 0.5);
		var that = this;

		this.pdpaper.on('blank:pdpaper', (event, x, y, delta) => {
			let scale = that.pdpaper.scale();
			that.pdpaper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
		});
	}

	initScPaper(): void {
		this.scgraph = new joint.dia.Graph();
		let d = $("#sccontent");
		let wid = d.width();
		let hei = d.height();
		this.scpaper = new joint.dia.Paper({
			el: $("#sccontent"),
			width: wid,
			height: hei,
			model: this.scgraph,
			gridSize: 10,
			drawGrid: true,
			background: {
				color: 'rgb(240,255,255)'
			}
		});
		this.scpaper.scale(0.8, 0.5);
		var that = this;

		this.scpaper.on('blank:scpaper', (event, x, y, delta) => {
			let scale = that.scpaper.scale();
			that.scpaper.scale(scale.sx + (delta * 0.01), scale.sy + (delta * 0.01));
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
			document.getElementById('droolsrulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#166dac'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('droolsrules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else if (tab === 'intermediate') {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'block';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('pdcontent').style.display = 'block';
			document.getElementById('droolsrulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#166dac'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('droolsrules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else if (tab === 'scenario') {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('scenarioPanel').style.display = 'block';
			document.getElementById('sccontent').style.display = 'block';
			document.getElementById('droolsrulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#166dac'
			document.getElementById('droolsrules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else if (tab === 'droolsrules') {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('droolsrulesPanel').style.display = 'block';
			document.getElementById('simulationPanel').style.display = 'none';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('droolsrules').style.background = '#166dac'
			document.getElementById('simulation').style.background = '#62a0cc'
		}
		else {
			document.getElementById('requirementsPanel').style.display = 'none';
			document.getElementById('intermediatePanel').style.display = 'none';
			document.getElementById('scenarioPanel').style.display = 'none';
			document.getElementById('droolsrulesPanel').style.display = 'none';
			document.getElementById('simulationPanel').style.display = 'block';
			document.getElementById('requirements').style.background = '#62a0cc'
			document.getElementById('intermediate').style.background = '#62a0cc'
			document.getElementById('scenario').style.background = '#62a0cc'
			document.getElementById('droolsrules').style.background = '#62a0cc'
			document.getElementById('simulation').style.background = '#166dac'
			var vid = document.getElementById('video')
			// vid.src = "assets/video/demo.mp4"
		}
	}

	generateRefinedRequirements() {
		var requirements: string = ''
		for (var i = 0; i < this.requirementTexts.split('\n').length; i++) {
			var requirement: string = this.requirementTexts.split('\n')[i];
			if (requirement.trim() !== '') {
				requirements = requirements + requirement;
				if (i !== this.requirementTexts.split('\n').length - 1) requirements = requirements + '//'
			}
		}
		this.generateService.refineRequirements(requirements, this.ontologyFilePath).subscribe(result => {
			console.log(result)
			this.refindeRequirements = result.refinedRequirements;
		})
	}

	problemDiagramDerivation() {
		var requirements = this.requirementTexts + '\n' + this.refindeRequirements;
		var allRequirements: string = ''
		for (var i = 0; i < requirements.split('\n').length; i++) {
			var requirement: string = requirements.split('\n')[i];
			if (requirement.trim() !== '') {
				allRequirements = allRequirements + requirement;
				if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
			}
		}
		this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath).subscribe(result => {
			this.phenomena = result.phenomena;
			this.referencePhenomena = result.referencePhenomena
			this.ovals = result.ovals
			this.rects = result.rectsWithoutSensors
			this.lines = result.linesWithoutSensors
			document.getElementById("intermediate").style.display = 'block';
			this.change_Menu("intermediate")
			this.showProblemDiagram(this.rects, this.ovals, this.lines)
		})
		this.closeDetails();
	}

	problemDiagramDerivation2() {
		var requirements = this.requirementTexts + '\n' + this.refindeRequirements;
		var allRequirements: string = ''
		for (var i = 0; i < requirements.split('\n').length; i++) {
			var requirement: string = requirements.split('\n')[i];
			if (requirement.trim() !== '') {
				allRequirements = allRequirements + requirement;
				if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
			}
		}
		this.pfService.getProblemDiagram(allRequirements, this.ontologyFilePath).subscribe(result => {
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
		})
		this.closeDetails();
	}

	scenarioDiagramDerivation(){
		document.getElementById("scenario").style.display = 'block';
		this.change_Menu("scenario");
		this.closeDetails();
	}

	ruleBasedCheck() {
		this.errors.length=0
		var requirements = this.requirementTexts + '\n' + this.refindeRequirements;
		var allRequirements: string = ''
		for (var i = 0; i < requirements.split('\n').length; i++) {
			var requirement: string = requirements.split('\n')[i];
			if (requirement.trim() !== '') {
				allRequirements = allRequirements + requirement;
				if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
			}
		}
		this.generateService.check(allRequirements, this.ontologyFilePath).subscribe(result => {
			this.errors = result;
			if (this.errors[0] === 'No Errors!') this.ruleErrorFlag = true;
			else this.ruleErrorFlag = false;
			this.scenarioErrorFlag = false;
			this.formalismErrorFlag = false;
			this.satisfactionErrorFlag = false;
		})
		this.closeDetails();
	}

	scenarioBasedCheck(){
		if (!this.ruleErrorFlag) alert('Please Solve The Rule Errors First!')
		else{
			this.errors.length=0
			this.errors.push('No Errors!');
			if (this.errors[0] === 'No Errors!') this.scenarioErrorFlag = true;
			else this.scenarioErrorFlag = false;
			this.formalismErrorFlag = false;
			this.satisfactionErrorFlag = false;
		}
		this.closeDetails();
	}

	formalismBasedCheck(){
		if (!this.scenarioErrorFlag) alert('Please Solve The Scenario Errors First!')
		else{
			this.errors.length=0
			this.errors.push('No Errors!');
			if (this.errors[0] === 'No Errors!') this.formalismErrorFlag = true;
			else this.formalismErrorFlag = false;
			this.satisfactionErrorFlag = false;
		}
		this.closeDetails();
	}

	satisfactionBasedCheck(){
		if (!this.formalismErrorFlag) alert('Please Solve The Formalism Errors First!')
		else{
			this.errors.length=0
			this.errors.push('No Errors!');
			if (this.errors[0] === 'No Errors!') this.satisfactionErrorFlag = true;
			else this.satisfactionErrorFlag = false;
		}
		this.closeDetails();
	}

	generateDroolsRules() {
		if (!this.satisfactionErrorFlag) alert('Please Solve The Satisfaction Errors First!')
		else {
			var requirements = this.requirementTexts + '\n' + this.refindeRequirements;
			var allRequirements: string = ''
			for (var i = 0; i < requirements.split('\n').length; i++) {
				var requirement: string = requirements.split('\n')[i];
				if (requirement.trim() !== '') {
					allRequirements = allRequirements + requirement;
					if (i !== requirements.split('\n').length - 1) allRequirements = allRequirements + '//'
				}
			}
			this.generateService.transformToDrools(allRequirements, this.ontologyFilePath).subscribe(result => {
				this.droolsRules = result;
				document.getElementById("droolsrules").style.display = 'block';
				this.change_Menu('droolsrules')
			})
		}
	}

	closeDetails(){
		var details = document.getElementsByClassName("detail");
		for(var i = 0;i < details.length;i++){
			var element:any = details[i];
			element.open = false;
		}
	}

	generateSimulation() {
		document.getElementById("simulation").style.display = 'block';
		this.change_Menu("simulation")
	}

	monacoOnInit(editor) {
		this.editor = editor;
	}
}
