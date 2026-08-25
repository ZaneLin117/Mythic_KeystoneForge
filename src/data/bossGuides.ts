import type { DungeonKey } from './dungeonKeys.ts'

export interface BossGuide {
  encounter: '1号' | '2号' | '3号' | '尾王'
  text: string
}

const guide = (encounter: BossGuide['encounter'], text: string): BossGuide => ({
  encounter,
  text,
})

const murd1 = guide(
  '1号',
  '开场主打咬咬，Boss分身出来后打断分身读条，咬咬到20%会破Boss护盾，这时转Boss开爆发。',
)
const murd2 = guide(
  '2号',
  '酒桶出现后，用下一轮火圈炸掉绿色毒桶，红线点名时每人躲到不同酒桶后面，别两人共用一个。',
)
const murd3 = guide(
  '3号',
  'Boss把斧头丢到地上后，斧头会持续炸团，立刻转火打掉，其他技能正常躲。',
)
const murdFinal = guide(
  '尾王',
  '混乱箭要打断，猎犬和小鬼出来就转火，小鬼尽量群控，Boss闪到远处并开传送门后，扩散波过来时点传送门躲。',
)

const nalo1 = guide(
  '1号',
  'Boss丢蘑菇时，每个蘑菇圈都要有人踩，漏一个会炸团，平时躲Boss前方扇形和地面尖刺。',
)
const nalo2 = guide(
  '2号',
  '蓝圈落地后会出小怪，先转火并打断，小怪死后接旁边白圈，暴雨时靠近Boss并踩小怪留下的雪堆抗击退。',
)
const nalo3 = guide(
  '3号',
  '三人被绿圈点名时把幻影集中放在同一角，NPC开减伤圈时站进去，幻影变红并冲向NPC时主动撞掉。',
)

const vale1 = guide(
  '1号',
  '三个Boss共享血量，直接一起A，光芒剑要打断，三朵花被光线连起来时站到光线上挡住，漏掉会炸团。',
)
const vale2 = guide(
  '2号',
  'Boss连线追人时，被追的人把Boss引过场上的荆棘清掉，其他人躲荆棘，践踏时注意别被击退进去。',
)
const vale3 = guide(
  '3号',
  '咕咕阶段打断读条，3人被风点名时彼此分开，70%变熊后会点3人放扇形，三人分散别让扇形重叠，40%后分身会重复这些技能。',
)
const valeFinal = guide(
  '尾王',
  '小怪出来先转火并打断，场边光球飞向Boss时DPS去挡，别让Boss吃到，Boss对坦克放直线技能时其他人别站在线上。',
)

const void1 = guide(
  '1号',
  '影子连线点名时全队尽量把连线朝同一侧摆，随后影子沿连线冲锋，几条冲锋路线别重叠，躲场上的永久紫圈和散射小球。',
)
const void2 = guide(
  '2号',
  '毒蛇小怪出现后立刻转火，Boss扇形喷吐点你时把方向带离人群，没被点的人躲开扇形，平时别踩毒池。',
)
const voidFinal = guide(
  '尾王',
  '黑洞出现后站3个黑洞中间抗吸，全员脚下出紫圈时互相分开，大球追你就引进黑洞，Boss连续射小球时一直移动。',
)

const fang1 = guide(
  '1号',
  'Boss冲向食物堆时躲开冲锋路径，开始进食后接圈并尽快破盾，平时躲落石和Boss周身大圈。',
)
const fang2 = guide(
  '2号',
  'P1连续3个毒素读条都要打断，全员被Boss连线拉扯时往外跑把线拉断，P2五只小怪一起A，小怪读条要断，被追的人一直跑别让它咬到。',
)
const fangFinal = guide(
  '尾王',
  'Boss和蛇头连线时站到线上挡线拿毒层，之后切骨者点名直线时至少2人一起分摊来消层，消层产生的毒水尽量放场边，躲反弹斧头。',
)

const rlp1 = guide(
  '1号',
  '凛冽飞弹要打断，Boss到66%和33%会出护盾，优先破盾并顺带A小龙，平时躲冰刺，龙卷风结束击退时别被推到冰刺上。',
)
const rlp2 = guide(
  '2号',
  '被大火圈点名后会出火元素，立刻转火，火元素死后马上离开它周围的大红圈，Boss瞄准的方向会滚大火球，躲开路线并远离树木。',
)
const rlp3 = guide(
  '3号',
  'P1主打人形Boss，躲龙的扇形喷吐，火圈点名时分散放到空地，人形Boss读阻断暴雨时别继续施法，40%后人龙合体，继续处理这些机制。',
)

const kr1 = guide(
  '1号',
  '两人被点名时集合，把两滩地板尽量叠在一起，地板变成软泥后立刻转火，别让软泥碰到Boss。',
)
const kr2 = guide(
  '2号',
  '火圈点名时别放在棺材旁，木乃伊出来后的读条必须打断，自己被抓进棺材就敲棺材提示队友，队友被抓就找被敲的棺材右键救人。',
)
const kr3 = guide(
  '3号',
  '三个Boss会轮流上场，死掉的Boss之后还会以灵魂形态继续放技能，出现分摊就集合，旋转飞斧躲开，智者召唤图腾后先转火火图腾。',
)
const krFinal = guide(
  '尾王',
  '80%前正常打Boss，场上的小龙咆哮要打断，80%后Boss骑上坐骑，两个目标共享伤害，继续打Boss本体，镀金毁灭后立刻离开Boss周围落下的土圈。',
)

const tos1 = guide(
  '1号',
  '护盾会在两个Boss之间来回切换，只打没盾的那个，风Boss击退前靠墙，击退后马上集合吃雷Boss分摊，雷Boss脚下出现大范围圈时离开这个圈，风圈点名时把风圈放到场边。',
)
const tos2 = guide(
  '2号',
  '队友被小蛇缠住时立刻转火救人，Boss钻地后会孵化小蛇，先打小蛇并打断毒素喷吐，Boss从场边横穿时躲开它的路径。',
)
const tos3 = guide(
  '3号',
  '电塔和Boss连线时，DPS站到两者之间挡线，挡线会叠物理易伤，别让坦克挡，地上的水及时躲开。',
)
const tosFinal = guide(
  '尾王',
  '这场的目标是让治疗把中间化身奶满，守护者死后先躲爆炸大圈，随后出现3个黑球时由3个DPS各撞1个，污染者出现就优先转火打掉，妖术师读条时及时打断，P2清掉追治疗的小怪。',
)

export const bossGuides: Partial<Record<DungeonKey, Record<number, BossGuide>>> = {
  murd: {
    234647: murd1,
    234660: murd1,
    234648: murd2,
    234649: murd3,
    234763: murdFinal,
  },
  nalo: {
    241812: nalo1,
    244100: nalo2,
    246404: nalo3,
    247301: nalo3,
  },
  vale: {
    243028: vale1,
    243029: vale1,
    243030: vale1,
    245912: vale2,
    247676: vale3,
    244887: valeFinal,
  },
  void: {
    238887: void1,
    239008: void2,
    239167: voidFinal,
  },
  fang: {
    259445: fang1,
    259446: fang2,
    259447: fangFinal,
  },
  rlp: {
    188252: rlp1,
    189232: rlp2,
    190485: rlp3,
    190484: rlp3,
  },
  kr: {
    135322: kr1,
    134993: kr2,
    269808: kr3,
    269810: kr3,
    269811: kr3,
    136160: krFinal,
  },
  tos: {
    262530: tos1,
    262822: tos1,
    133384: tos2,
    263658: tos3,
    133392: tosFinal,
  },
}

export function getBossGuide(dungeonKey: DungeonKey, mobId: number): BossGuide | undefined {
  return bossGuides[dungeonKey]?.[mobId]
}
