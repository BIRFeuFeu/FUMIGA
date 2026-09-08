export type EconomySnapshot = {
  biomass: number;
  biomassCapacity: number;
};

export class EconomyManager {
  private biomassValue = 100;
  private biomassCapacityValue = 200;

  get biomass() {
    return this.biomassValue;
  }

  get capacity() {
    return this.biomassCapacityValue;
  }

  snapshot(): EconomySnapshot {
    return { biomass: this.biomassValue, biomassCapacity: this.biomassCapacityValue };
  }

  trySpend(amount: number) {
    if (amount < 0 || this.biomassValue < amount) return false;
    this.biomassValue -= amount;
    return true;
  }

  addBiomass(amount: number) {
    this.biomassValue = Math.min(this.biomassCapacityValue, this.biomassValue + Math.max(0, amount));
  }

  increaseCapacity(amount: number) {
    this.biomassCapacityValue += Math.max(0, amount);
  }
}
