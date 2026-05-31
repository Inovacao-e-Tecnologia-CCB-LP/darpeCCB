let estruturaInscritos = {};

/* =========================
   LISTAGEM
========================= */

function renderAccordionInscritos(grupos, adminMode = false) {
	const { locaisMap, programacaoMap, instrumentosMap, tiposVisitaMap } = estruturaInscritos;
	let html = '<div class="accordion" id="accordionInscritos">';
	let index = 0;

	Object.entries(grupos).forEach(([local, programacoes]) => {
		const pidsValidos = Object.keys(programacoes).filter((pid) => programacaoMap[pid]);
		if (!pidsValidos.length) return;
		const currentIndex = index;
		const pRef = programacaoMap[pidsValidos[0]];
		const localObj = locaisMap[pRef.local_id];

		html += `
		<div class="accordion-item border-dark">
			<h2 class="accordion-header">
				<button
					class="accordion-button collapsed bg-dark text-white"
					data-bs-toggle="collapse"
					data-bs-target="#collapse-${currentIndex}">
					${local}
				</button>
			</h2>

			<div
				id="collapse-${currentIndex}"
				class="accordion-collapse collapse"
				data-bs-parent="#accordionInscritos">
				${
					!adminMode
						? `
					<p class="link-mapa copy-text"
						data-localid="${pRef.local_id}"
						title="Copiar endereço e abrir mapa">
						<i class="bi bi-geo-alt-fill me-1"></i>
						${localObj?.endereco ?? 'Endereço não informado'}
					</p>
				`
						: ''
				}
				<div class="accordion-body bg-light">
		`;

		pidsValidos.forEach((pid) => {
			const inscritosLista = programacoes[pid];
			const p = programacaoMap[pid];
			const tipo = tiposVisitaMap[p.tipo_visita_id];
			const nomeTipo = tipo?.nome || 'Tipo não encontrado';

			html += `
			<div class="card mb-3 border-dark">
				<div class="card-header bg-dark text-white d-flex justify-content-between align-items-center gap-2 py-3">
					<div class="text-start">
						<div class="fw-semibold fs-6">
							${nomeTipo} • ${formatarData(p.data)}
						</div>
						<div class="small opacity-75">
							${p.descricao} • ${formatarHorario(p.horario)}
						</div>
					</div>

					${
						!adminMode
							? `
						<button
							class="btn btn-sm btn-success flex-shrink-0"
							onclick="compartilhar(${pid})">
							<i class="bi bi-whatsapp"></i>
							<span class="d-none d-md-inline ms-1">
								Compartilhar
							</span>
						</button>
					`
							: ''
					}
				</div>
				<ul class="list-group list-group-flush">
			`;

			inscritosLista.forEach((i) => {
				const auth = localStorageService.buscarAutorizacao(i.id);
				const podeExcluir = adminMode || (auth && auth.token === i.delete_token);
				const instNome = instrumentosService.obterNomeInstrumento(i, instrumentosMap);

				html += `
				<li class="list-group-item d-flex justify-content-between align-items-center gap-2 py-3">
					<span class="d-flex flex-column align-items-start">
						<span class="fw-semibold">
							${i.nome}
						</span>
						<span class="text-muted small">
							${instNome}
						</span>
					</span>
					${
						podeExcluir
							? `
						<button
							class="btn btn-sm btn-outline-danger excluir-btn"
							onclick="${adminMode ? `excluirInscricaoAdmin(${i.id}, this)` : `excluirInscricao(${i.id}, this)`}">
							<i class="bi bi-trash"></i>
							<span class="btn-text">
								Excluir
							</span>
						</button>
					`
							: ''
					}
				</li>
				`;
			});

			html += `
				</ul>
			</div>
			`;
		});

		html += `
				</div>
			</div>
		</div>
		`;

		index++;
	});

	html += '</div>';

	conteudo.innerHTML =
		index === 0
			? `
	<div class="alert alert-secondary text-center">
		Nenhuma inscrição encontrada
	</div>`
			: html;
}

function renderCardsInscricoesAdmin(grupos) {
	const { locaisMap, programacaoMap, instrumentosMap, tiposVisitaMap } = estruturaInscritos;

	const lista = document.getElementById('listaInscricoesAdmin');

	let html = '';

	Object.entries(grupos).forEach(([local, programacoes]) => {
		const totalLocal = Object.values(programacoes).flat().length;

		html += `
			<div class="grupo-secao">
				<div class="grupo-secao-header">
					<i class="bi bi-geo-alt-fill"></i>
					<span>
						${local}
					</span>
					<span class="grupo-secao-count">
						Total: ${totalLocal}
					</span>
				</div>
				<div class="d-flex flex-column gap-3">
			`;

		Object.entries(programacoes).forEach(([pid, inscritos]) => {
			const p = programacaoMap[pid];

			if (!p) return;

			const tipo = tiposVisitaMap[p.tipo_visita_id];

			html += `
					<div class="item-card">
						<div class="item-card-body">
							<div class="fw-semibold">
								${tipo?.nome || ''} • ${formatarData(p.data)}
							</div>

							<div class="text-muted small mb-3">
								${p.descricao} • ${formatarHorario(p.horario)}
							</div>
							<div class="d-flex flex-column gap-2">
					`;

			inscritos.forEach((i) => {
				const instNome = instrumentosService.obterNomeInstrumento(i, instrumentosMap);

				html += `
							<div class="item-card item-card-compacto">
								<div class="item-card-body d-flex justify-content-between align-items-center">
									<div>
										<div class="fw-semibold">
											${i.nome}
										</div>

										<div class="small text-muted">
											${instNome}
										</div>
									</div>

									<button
										class="btn btn-sm btn-outline-danger excluir-btn"
										onclick="
										excluirInscricaoAdmin(
											${i.id},
											this
										)
									">
										<i class="bi bi-trash"></i>
										<span class="btn-text">
											Excluir
										</span>
									</button>

								</div>
							</div>
							`;
			});
			html += `
							</div>
						</div>
					</div>
					`;
		});

		html += `
				</div>
			</div>
			`;
	});

	lista.innerHTML = `<div class="d-flex flex-column gap-4">${html}</div>`;
}

/* =========================
   VISUALIZAR INSCRIÇÕES
========================= */

async function showInscritos() {
	setTitle('Inscrições');

	conteudo.innerHTML = `
    <div class="spinner-border text-dark" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>`;

	travarUI();

	try {
		const inscritos = (await inscricoesService.listar()) || [];

		dataStore.inscritos = inscritos;

		if (!inscritos.length) {
			conteudo.innerHTML = `
        <div class="alert alert-secondary text-center">
          Nenhuma inscrição encontrada
        </div>`;
			return;
		}

		estruturaInscritos = inscricoesService.montarEstrutura(
			inscritos,
			dataStore.locais,
			dataStore.programacao,
			dataStore.instrumentos || [],
			dataStore.tipos_visita || [],
		);

		renderAccordionInscritos(estruturaInscritos.grupos);

		copiarTexto(conteudo);
	} catch (err) {
		console.error(err);

		conteudo.innerHTML = `
      <div class="alert alert-dark text-center">
        Erro ao carregar inscrições
      </div>`;
	} finally {
		liberarUI();
	}
}

async function showInscritosAdmin() {
	setTitle('Inscrições');

	conteudo.innerHTML = `
	<div id="listaInscricoesAdmin">
		<div class="text-center my-4">
			<div class="spinner-border text-dark"></div>
		</div>
	</div>
	`;

	travarUI();

	try {
		const inscritos = (await inscricoesService.listarTodas()) || [];
		if (!inscritos.length) {
			document.getElementById('listaInscricoesAdmin').innerHTML = `
			<div class="alert alert-secondary text-center">
				Nenhuma inscrição encontrada
			</div>
			`;
			return;
		}

		estruturaInscritos = inscricoesService.montarEstrutura(
			inscritos,
			dataStore.locais,
			dataStore.programacao,
			dataStore.instrumentos || [],
			dataStore.tipos_visita || [],
		);

		renderCardsInscricoesAdmin(estruturaInscritos.grupos);
	} catch (e) {
		console.error(e);

		document.getElementById('listaInscricoesAdmin').innerHTML = `
		<div class="alert alert-danger text-center">
			Erro ao carregar inscrições
		</div>
		`;
	} finally {
		liberarUI();
	}
}

/* =========================
   EXCLUIR INSCRIÇÕES
========================= */

async function excluirInscricao(id, btn) {
	const auth = localStorageService.buscarAutorizacao(id);

	if (!auth) {
		abrirModalAviso('Erro', 'Você não tem permissão para excluir esta inscrição');
		return;
	}

	const confirmou = await abrirModalConfirmacao(
		'Deseja realmente excluir esta inscrição?',
		'Excluir',
	);
	if (!confirmou) return;

	const originalHTML = btn.innerHTML;
	const originalClass = btn.className;

	btn.disabled = true;
	btn.className = 'btn btn-sm btn-danger';
	btn.innerHTML = '<span class="spinner-border spinner-border-sm text-light"></span>';

	try {
		const r = await inscricoesService.excluir(id, auth.token);

		if (!r?.success) throw r;

		localStorageService.removerAutorizacao(id);
		abrirModalAviso('Sucesso', 'Inscrição excluída com sucesso');
		showInscritos();
	} catch (e) {
		console.error(e);
		abrirModalAviso('Erro', 'Erro ao excluir inscrição');
	} finally {
		btn.disabled = false;
		btn.innerHTML = originalHTML;
	}
}

async function excluirInscricaoAdmin(id, btn) {
	const confirmou = await abrirModalConfirmacao('Deseja excluir esta inscrição?', 'Excluir');
	if (!confirmou) return;
	const originalHTML = btn.innerHTML;

	btn.disabled = true;
	btn.className = 'btn btn-sm btn-danger';
	btn.innerHTML = '<span class="spinner-border spinner-border-sm text-light"></span>';

	travarUI();

	try {
		const r = await inscricoesService.excluirAdmin(id);
		if (!r?.success) throw r;
		abrirModalAviso('Sucesso', 'Inscrição excluída com sucesso');
		await showInscritosAdmin();
	} catch (e) {
		console.error(e);
		abrirModalAviso('Erro', 'Erro ao excluir inscrição');
	} finally {
		btn.disabled = false;
		btn.innerHTML = originalHTML;
		liberarUI();
	}
}

/* =========================
   COMPARTILHAR MENSAGEM WHATSAPP
========================= */

function compartilhar(pid) {
	const { tiposVisitaMap } = estruturaInscritos;

	const { locaisMap, programacaoMap, instrumentosMap, inscritosPorProgramacao } =
		estruturaInscritos;

	const p = programacaoMap[pid];
	if (!p) {
		abrirModalAviso('Erro', 'Programação não encontrada');
		return;
	}

	const localObj = locaisMap[p.local_id];
	if (!localObj) {
		abrirModalAviso('Erro', 'Local não encontrado');
		return;
	}

	const inscritosProg = inscritosPorProgramacao[pid] || [];
	const dataFormatada = formatarData(p.data);

	const tipo = tiposVisitaMap[p.tipo_visita_id];
	const nomeTipo = tipo?.nome || 'Tipo não encontrado';

	let mensagem = `*${localObj.nome}*\n\n`;
	mensagem += ` _${localObj.endereco}_\n`;
	mensagem += ` *${nomeTipo}*\n`;
	mensagem += ` ${dataFormatada}\n`;
	mensagem += ` ${formatarHorario(p.horario)}\n\n`;
	mensagem += `*Inscritos(${inscritosProg.length}/${localObj.limite}):*\n`;

	inscritosProg.forEach((i) => {
		const instNome = instrumentosService.obterNomeInstrumento(i, instrumentosMap);

		mensagem += `• ${i.nome} _(${instNome})_\n`;
	});

	mensagem = encodeURIComponent(mensagem);

	window.open(`https://wa.me/?text=${mensagem}`, '_blank', 'noopener,noreferrer');
}
